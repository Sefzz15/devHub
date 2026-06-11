import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls.js';
import type {SolveRequest, SolveResponse} from './solver.worker';
import {CubeSnapshot, RubiksStateService} from './rubiks-state.service';

type Axis = 'x' | 'y' | 'z';

/** A single layer turn: rotate the `layer` slice (-1, 0 or 1) around `axis`. */
interface Move {
  axis: Axis;
  layer: number;
  dir: 1 | -1;
}

interface ActiveRotation {
  pivot: THREE.Group;
  axis: Axis;
  fromAngle: number;
  toAngle: number;
  start: number;
  duration: number;
}

/** An in-progress live drag where the slice follows the cursor. */
interface Turn {
  axis: Axis;
  layer: number;
  pivot: THREE.Group;
  /** Normalised screen-space direction the user is dragging along. */
  screenDir: THREE.Vector2;
  /** Pixels of screen travel per world unit along that direction. */
  pixelsPerWorld: number;
  /** Distance of the grabbed sticker from the rotation axis. */
  radius: number;
  /** +1 / -1: maps drag-along-screenDir to a positive/negative pivot angle. */
  angleSign: number;
}

interface DragState {
  startX: number;
  startY: number;
  /** World-space outward normal of the clicked sticker, snapped to an axis. */
  normal: THREE.Vector3;
  /** Grid position of the clicked cubie. */
  point: THREE.Vector3;
  /** Set once the drag passes the threshold and a slice is grabbed. */
  turn: Turn | null;
}

@Component({
  selector: 'app-rubiks-cube',
  standalone: false,
  templateUrl: './rubiks-cube.component.html',
  styleUrls: ['../admin/admin.component.css', './rubiks-cube.component.css'],
})
export class RubiksCubeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', {static: true}) host!: ElementRef<HTMLDivElement>;

  // --- tunables ---
  private readonly spacing = 1.0;
  private readonly cubieSize = 0.94;
  private readonly duration = 220; // ms per turn

  private readonly colors = {
    right: 0xb71234, // +x red
    left: 0xff5800, // -x orange
    top: 0x009b48, // +y green
    bottom: 0x0046ad, // -y blue
    front: 0xffd500, // +z yellow
    back: 0xffffff, // -z white
    inner: 0x161616,
  };

  /** Keyboard letter -> base move (Shift inverts `dir`). 'p' = down per request. */
  private readonly keyMoves: Record<string, Move> = {
    f: {axis: 'z', layer: 1, dir: -1},
    b: {axis: 'z', layer: -1, dir: 1},
    u: {axis: 'y', layer: 1, dir: -1},
    d: {axis: 'y', layer: -1, dir: 1},
    p: {axis: 'y', layer: -1, dir: 1},
    l: {axis: 'x', layer: -1, dir: 1},
    r: {axis: 'x', layer: 1, dir: -1},
  };

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: TrackballControls;
  private cubeGroup!: THREE.Group;
  private cubies: THREE.Mesh[] = [];

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  private queue: Move[] = [];
  private active: ActiveRotation | null = null;
  private drag: DragState | null = null;
  private frameId = 0;

  /** Web worker running the Kociemba two-phase solver off the UI thread. */
  private solver?: Worker;
  /** True while the worker is computing a solution (drives button state). */
  solving = false;
  /** Last solve result shown in the UI (move count + algorithm). */
  solveInfo = '';

  // bound listeners (kept for removal)
  private readonly onPointerDown = (e: PointerEvent) => this.handlePointerDown(e);
  private readonly onPointerMove = (e: PointerEvent) => this.handlePointerMove(e);
  private readonly onPointerUp = () => this.handlePointerUp();

  constructor(private zone: NgZone, private state: RubiksStateService) {
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initThree();
      this.buildCube();
      // Bring back the scramble + camera angle from a previous visit, if any.
      const snapshot = this.state.load();
      if (snapshot) this.restoreState(snapshot);
      const el = this.renderer.domElement;
      // capture phase so we can veto OrbitControls before it starts orbiting
      el.addEventListener('pointerdown', this.onPointerDown, true);
      window.addEventListener('pointermove', this.onPointerMove);
      window.addEventListener('pointerup', this.onPointerUp);
      this.animate();
    });
    this.initSolver();
  }

  /** Spin up the solver worker (browser only — SSR has no Worker). */
  private initSolver(): void {
    if (typeof Worker === 'undefined') return;
    this.solver = new Worker(new URL('./solver.worker', import.meta.url));
    this.solver.onmessage = ({data}: MessageEvent<SolveResponse>) =>
      this.onSolved(data);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    // Persist the current state so it's there when the user navigates back.
    this.state.save(this.captureState());
    const el = this.renderer?.domElement;
    el?.removeEventListener('pointerdown', this.onPointerDown, true);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.disposeCube();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.solver?.terminate();
  }

  // ---------------------------------------------------------------- setup

  private initThree(): void {
    const host = this.host.nativeElement;
    const width = host.clientWidth || 600;
    const height = host.clientHeight || 600;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1116);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(4.5, 4.5, 6);

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    host.appendChild(this.renderer.domElement);

    // TrackballControls: free rotation in any direction, no polar/360 limit
    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 3.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.noPan = true;
    this.controls.staticMoving = false; // momentum/easing
    this.controls.dynamicDampingFactor = 0.15;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 14;
    this.controls.keys = ['', '', '']; // don't steal the F/B/U/D/L/R move keys

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.7);
    key.position.set(5, 8, 6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-6, -3, -4);
    this.scene.add(fill);

    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);
  }

  private buildCube(): void {
    const geo = new THREE.BoxGeometry(this.cubieSize, this.cubieSize, this.cubieSize);
    for (let gx = -1; gx <= 1; gx++) {
      for (let gy = -1; gy <= 1; gy++) {
        for (let gz = -1; gz <= 1; gz++) {
          // BoxGeometry material order: +x, -x, +y, -y, +z, -z
          const mats = [
            this.faceMat(gx === 1 ? this.colors.right : this.colors.inner),
            this.faceMat(gx === -1 ? this.colors.left : this.colors.inner),
            this.faceMat(gy === 1 ? this.colors.top : this.colors.inner),
            this.faceMat(gy === -1 ? this.colors.bottom : this.colors.inner),
            this.faceMat(gz === 1 ? this.colors.front : this.colors.inner),
            this.faceMat(gz === -1 ? this.colors.back : this.colors.inner),
          ];
          const cubie = new THREE.Mesh(geo, mats);
          cubie.position.set(gx * this.spacing, gy * this.spacing, gz * this.spacing);
          // Remember the solved home so a restored snapshot can match colours.
          cubie.userData['home'] = `${gx},${gy},${gz}`;
          this.cubeGroup.add(cubie);
          this.cubies.push(cubie);
        }
      }
    }
  }

  private faceMat(color: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({color, roughness: 0.45, metalness: 0.05});
  }

  private disposeCube(): void {
    for (const c of this.cubies) {
      (c.material as THREE.Material[]).forEach((m) => m.dispose());
      c.geometry.dispose();
      c.parent?.remove(c);
    }
    this.cubies = [];
  }

  // ---------------------------------------------------------------- persistence

  /**
   * Serialise the live cube + camera into a plain snapshot. World transforms are
   * read so it stays correct even if a slice is mid-turn (parented to a pivot).
   */
  private captureState(): CubeSnapshot {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const cubies = this.cubies.map((c) => {
      c.getWorldPosition(pos);
      c.getWorldQuaternion(quat);
      return {
        home: c.userData['home'] as string,
        position: [pos.x, pos.y, pos.z] as [number, number, number],
        quaternion: [quat.x, quat.y, quat.z, quat.w] as [number, number, number, number],
      };
    });

    const target = this.controls.target;
    return {
      cubies,
      camera: {
        position: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
        up: [this.camera.up.x, this.camera.up.y, this.camera.up.z],
        target: [target.x, target.y, target.z],
      },
      solveInfo: this.solveInfo,
    };
  }

  /** Apply a snapshot onto the freshly built (solved) cube and camera. */
  private restoreState(snapshot: CubeSnapshot): void {
    // Guard against a stale snapshot from a different build.
    if (snapshot.cubies.length !== this.cubies.length) return;

    const byHome = new Map(snapshot.cubies.map((s) => [s.home, s]));
    // cubeGroup sits at the origin with no transform, so local == world here.
    for (const c of this.cubies) {
      const s = byHome.get(c.userData['home'] as string);
      if (!s) continue;
      c.position.fromArray(s.position);
      c.quaternion.fromArray(s.quaternion);
    }

    this.camera.position.fromArray(snapshot.camera.position);
    this.camera.up.fromArray(snapshot.camera.up);
    this.controls.target.fromArray(snapshot.camera.target);
    this.controls.update();
    this.solveInfo = snapshot.solveInfo;
  }

  // ---------------------------------------------------------------- loop

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    this.stepRotation();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private stepRotation(): void {
    if (!this.active) return;
    const a = this.active;
    const t = Math.min((performance.now() - a.start) / a.duration, 1);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
    a.pivot.rotation[a.axis] = a.fromAngle + (a.toAngle - a.fromAngle) * e;
    if (t >= 1) this.finalizeRotation();
  }

  private finalizeRotation(): void {
    const a = this.active!;
    a.pivot.rotation[a.axis] = a.toAngle;
    a.pivot.updateMatrixWorld(true);
    for (const child of [...a.pivot.children]) {
      this.cubeGroup.attach(child); // re-parent, preserving world transform
      child.position.set(
        Math.round(child.position.x),
        Math.round(child.position.y),
        Math.round(child.position.z),
      );
    }
    this.scene.remove(a.pivot);
    this.active = null;
    this.dequeue();
  }

  // ---------------------------------------------------------------- moves

  private enqueue(move: Move): void {
    this.queue.push(move);
    this.dequeue();
  }

  private dequeue(): void {
    // hold off while a live drag owns a detached slice
    if (this.active || this.drag?.turn || this.queue.length === 0) return;
    this.startMove(this.queue.shift()!);
  }

  private startMove(move: Move): void {
    const pivot = this.grabLayer(move.axis, move.layer);
    this.active = {
      pivot,
      axis: move.axis,
      fromAngle: 0,
      toAngle: (move.dir * Math.PI) / 2,
      start: performance.now(),
      duration: this.duration,
    };
  }

  /** Detach a slice's cubies onto a fresh pivot at the origin. */
  private grabLayer(axis: Axis, layer: number): THREE.Group {
    const pivot = new THREE.Group();
    this.scene.add(pivot);
    for (const c of this.cubies) {
      if (Math.round(c.position[axis]) === layer) pivot.attach(c);
    }
    return pivot;
  }

  // ---------------------------------------------------------------- input

  private handlePointerDown(event: PointerEvent): void {
    const hit = this.raycast(event);
    if (!hit) {
      // background drag -> let OrbitControls orbit the camera
      this.controls.enabled = true;
      this.drag = null;
      return;
    }
    // started on the cube -> stop the camera, prepare a slice turn
    this.controls.enabled = false;

    if (this.active || this.queue.length) {
      this.drag = null; // mid-animation: ignore this gesture
      return;
    }

    const normal = this.snapToAxis(
      hit.face!.normal.clone().transformDirection(hit.object.matrixWorld),
    );
    const point = (hit.object as THREE.Mesh).position.clone().round();
    this.drag = {startX: event.clientX, startY: event.clientY, normal, point, turn: null};
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.drag) return;
    const dx = event.clientX - this.drag.startX;
    const dy = event.clientY - this.drag.startY;

    if (this.drag.turn) {
      this.applyLiveAngle(dx, dy); // already grabbed: follow the cursor
    } else if (Math.hypot(dx, dy) >= 8) {
      this.beginTurn(dx, dy); // far enough to know which slice & direction
    }
  }

  private handlePointerUp(): void {
    this.controls.enabled = true;
    const turn = this.drag?.turn;
    if (turn) {
      // snap whatever angle we're at to the nearest quarter turn
      const from = turn.pivot.rotation[turn.axis];
      const to = Math.round(from / (Math.PI / 2)) * (Math.PI / 2);
      this.active = {
        pivot: turn.pivot,
        axis: turn.axis,
        fromAngle: from,
        toAngle: to,
        start: performance.now(),
        duration: 140,
      };
    }
    this.drag = null;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const base = this.keyMoves[event.key.toLowerCase()];
    if (!base) return;
    event.preventDefault();
    this.enqueue({
      axis: base.axis,
      layer: base.layer,
      dir: (event.shiftKey ? -base.dir : base.dir) as 1 | -1,
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.renderer) return;
    const host = this.host.nativeElement;
    const width = host.clientWidth;
    const height = host.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.controls.handleResize();
  }

  // ---------------------------------------------------------------- buttons

  scramble(): void {
    const axes: Axis[] = ['x', 'y', 'z'];
    for (let i = 0; i < 20; i++) {
      this.enqueue({
        axis: axes[Math.floor(Math.random() * 3)],
        layer: Math.floor(Math.random() * 3) - 1,
        dir: Math.random() < 0.5 ? 1 : -1,
      });
    }
  }

  reset(): void {
    this.zone.runOutsideAngular(() => {
      this.queue = [];
      this.active = null;
      this.disposeCube();
      this.buildCube();
    });
    this.solveInfo = '';
  }

  /** Read the current state and ask the worker for a near-optimal solution. */
  solve(): void {
    // Need a settled cube: no animation, queued moves or live drag in flight.
    if (this.solving || !this.solver || this.active || this.queue.length || this.drag) {
      return;
    }
    const facelets = this.readFacelets();
    // Fast path: an already-solved cube needs no worker round-trip.
    if (this.isUniform(facelets)) {
      this.solveInfo = 'Already solved';
      return;
    }
    this.solving = true;
    this.solveInfo = '';
    const message: SolveRequest = {facelets};
    this.solver.postMessage(message);
  }

  /** True when every face shows a single colour (i.e. the cube is solved). */
  private isUniform(facelets: string): boolean {
    for (let f = 0; f < 6; f++) {
      const block = facelets.slice(f * 9, f * 9 + 9);
      if ([...block].some((ch) => ch !== block[0])) return false;
    }
    return true;
  }

  /** Worker callback: turn the algorithm into queued moves and play it back. */
  private onSolved(data: SolveResponse): void {
    this.zone.run(() => {
      this.solving = false;
      if (data.error) {
        this.solveInfo = 'Solve failed';
        console.error('Rubik solver error:', data.error);
        return;
      }
      const algo = (data.solution ?? '').trim();
      const moves = this.parseSolution(algo);
      this.solveInfo = moves.length ? `${moves.length} moves: ${algo}` : 'Already solved';
      for (const move of moves) this.enqueue(move);
    });
  }

  // ---------------------------------------------------------------- helpers

  private raycast(event: PointerEvent): THREE.Intersection | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.cubies, false);
    return hits.length ? hits[0] : null;
  }

  /** Turn an arbitrary vector into the nearest unit axis vector. */
  private snapToAxis(v: THREE.Vector3): THREE.Vector3 {
    const ax = Math.abs(v.x);
    const ay = Math.abs(v.y);
    const az = Math.abs(v.z);
    if (ax >= ay && ax >= az) return new THREE.Vector3(Math.sign(v.x), 0, 0);
    if (ay >= az) return new THREE.Vector3(0, Math.sign(v.y), 0);
    return new THREE.Vector3(0, 0, Math.sign(v.z));
  }

  private vecAxis(v: THREE.Vector3): Axis {
    if (Math.abs(v.x) >= Math.abs(v.y) && Math.abs(v.x) >= Math.abs(v.z)) return 'x';
    if (Math.abs(v.y) >= Math.abs(v.z)) return 'y';
    return 'z';
  }

  private unitAxis(axis: Axis): THREE.Vector3 {
    return new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
  }

  /**
   * The drag has cleared the threshold, so decide which slice was grabbed.
   * The clicked face has normal `n`; we pick the in-plane direction whose
   * screen projection best matches the drag, then rotate the slice about the
   * perpendicular in-plane axis so the sticker tracks the cursor.
   */
  private beginTurn(dx: number, dy: number): void {
    const n = this.drag!.normal;
    const p = this.drag!.point;
    const allAxes = [this.unitAxis('x'), this.unitAxis('y'), this.unitAxis('z')];
    const normalAxis = this.vecAxis(n);
    const tangents = allAxes.filter((a) => this.vecAxis(a) !== normalAxis);

    const dragLen = Math.hypot(dx, dy);
    let bestDir: THREE.Vector3 | null = null;
    let bestScreen = new THREE.Vector2();
    let bestPixelsPerWorld = 0;
    let bestScore = -Infinity;
    for (const t of tangents) {
      for (const sign of [1, -1]) {
        const dir = t.clone().multiplyScalar(sign);
        const s = this.worldDirToScreen(p, dir);
        const len = s.length();
        if (len < 1e-6) continue;
        const score = (dx * s.x + dy * s.y) / (dragLen * len); // cosine similarity
        if (score > bestScore) {
          bestScore = score;
          bestDir = dir;
          bestScreen = s.clone();
          bestPixelsPerWorld = len;
        }
      }
    }
    if (!bestDir) return;

    const d = bestDir; // world drag direction (a unit axis)
    const axis = this.vecAxis(new THREE.Vector3().crossVectors(n, d));
    const layer = Math.round(p[axis]);

    // motion of the grabbed point per +1 rad about the positive axis
    const motion = new THREE.Vector3().crossVectors(this.unitAxis(axis), p);
    const radius = Math.max(motion.length(), 0.5);
    const angleSign = motion.dot(d) >= 0 ? 1 : -1;

    this.drag!.turn = {
      axis,
      layer,
      pivot: this.grabLayer(axis, layer),
      screenDir: bestScreen.normalize(),
      pixelsPerWorld: bestPixelsPerWorld,
      radius,
      angleSign,
    };
    this.applyLiveAngle(dx, dy);
  }

  /** Rotate the grabbed slice so it follows the current drag offset. */
  private applyLiveAngle(dx: number, dy: number): void {
    const turn = this.drag!.turn!;
    const projPixels = dx * turn.screenDir.x + dy * turn.screenDir.y;
    const worldDrag = projPixels / turn.pixelsPerWorld;
    turn.pivot.rotation[turn.axis] = (turn.angleSign * worldDrag) / turn.radius;
  }

  /** Screen-space (pixel) direction of a world-space direction at a point. */
  private worldDirToScreen(origin: THREE.Vector3, dir: THREE.Vector3): THREE.Vector2 {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const a = origin.clone().project(this.camera);
    const b = origin.clone().add(dir).project(this.camera);
    return new THREE.Vector2(
      ((b.x - a.x) * rect.width) / 2,
      (-(b.y - a.y) * rect.height) / 2,
    );
  }

  // ---------------------------------------------------------------- solver i/o

  /**
   * Serialise the cube into Kociemba's 54-char facelet string: faces in
   * U R F D L B order, each read in standard reading order (left→right,
   * top→bottom when looking at that face). Each sticker becomes its face
   * letter, derived from its colour. Our solved scheme is
   * green=U(+y) red=R(+x) yellow=F(+z) blue=D(-y) orange=L(-x) white=B(-z).
   */
  private readFacelets(): string {
    const byPos = new Map<string, THREE.Mesh>();
    for (const c of this.cubies) {
      const p = c.position.clone().round();
      byPos.set(`${p.x},${p.y},${p.z}`, c);
    }
    const palette: {hex: number; face: string}[] = [
      {hex: this.colors.top, face: 'U'},
      {hex: this.colors.right, face: 'R'},
      {hex: this.colors.front, face: 'F'},
      {hex: this.colors.bottom, face: 'D'},
      {hex: this.colors.left, face: 'L'},
      {hex: this.colors.back, face: 'B'},
    ];
    // Per face: outward normal + (row, col) -> grid position, row/col matching
    // the standard facelet numbering for that face.
    const faces: {n: THREE.Vector3; pos: (r: number, c: number) => THREE.Vector3}[] = [
      {n: new THREE.Vector3(0, 1, 0), pos: (r, c) => new THREE.Vector3(c - 1, 1, r - 1)},   // U
      {n: new THREE.Vector3(1, 0, 0), pos: (r, c) => new THREE.Vector3(1, 1 - r, 1 - c)},   // R
      {n: new THREE.Vector3(0, 0, 1), pos: (r, c) => new THREE.Vector3(c - 1, 1 - r, 1)},   // F
      {n: new THREE.Vector3(0, -1, 0), pos: (r, c) => new THREE.Vector3(c - 1, -1, 1 - r)}, // D
      {n: new THREE.Vector3(-1, 0, 0), pos: (r, c) => new THREE.Vector3(-1, 1 - r, c - 1)}, // L
      {n: new THREE.Vector3(0, 0, -1), pos: (r, c) => new THREE.Vector3(1 - c, 1 - r, -1)}, // B
    ];

    let str = '';
    for (const f of faces) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const p = f.pos(r, c);
          const cubie = byPos.get(`${p.x},${p.y},${p.z}`)!;
          str += this.nearestFace(this.outwardColor(cubie, f.n), palette);
        }
      }
    }
    return str;
  }

  /** Colour (hex) of the sticker on `cubie` currently facing world normal `n`. */
  private outwardColor(cubie: THREE.Mesh, n: THREE.Vector3): number {
    const q = cubie.getWorldQuaternion(new THREE.Quaternion());
    // BoxGeometry material order: +x, -x, +y, -y, +z, -z.
    const localNormals = [
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
    ];
    const mats = cubie.material as THREE.MeshStandardMaterial[];
    for (let i = 0; i < 6; i++) {
      const w = localNormals[i].applyQuaternion(q).round();
      if (w.x === n.x && w.y === n.y && w.z === n.z) return mats[i].color.getHex();
    }
    return this.colors.inner;
  }

  /** Nearest face letter for a colour, robust to colour-space round-tripping. */
  private nearestFace(hex: number, palette: {hex: number; face: string}[]): string {
    const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
    let best = palette[0];
    let bestDist = Infinity;
    for (const p of palette) {
      const dr = r - ((p.hex >> 16) & 255);
      const dg = g - ((p.hex >> 8) & 255);
      const db = b - (p.hex & 255);
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = p;
      }
    }
    return best.face;
  }

  /**
   * Parse a solution like "R U R' U2 F" into queue moves. Our F/B/U/D/L/R base
   * turns are exactly the clockwise face turns of standard notation; "'" flips
   * direction and "2" is two quarter turns.
   */
  private parseSolution(algo: string): Move[] {
    const base: Record<string, Move> = {
      U: {axis: 'y', layer: 1, dir: -1},
      D: {axis: 'y', layer: -1, dir: 1},
      R: {axis: 'x', layer: 1, dir: -1},
      L: {axis: 'x', layer: -1, dir: 1},
      F: {axis: 'z', layer: 1, dir: -1},
      B: {axis: 'z', layer: -1, dir: 1},
    };
    const moves: Move[] = [];
    for (const token of algo.split(/\s+/)) {
      const b = base[token[0]];
      if (!b) continue;
      const mod = token.slice(1);
      if (mod === "'") {
        moves.push({...b, dir: (-b.dir) as 1 | -1});
      } else if (mod === '2') {
        moves.push({...b}, {...b});
      } else {
        moves.push({...b});
      }
    }
    return moves;
  }
}
