import {Injectable} from '@angular/core';

/** One cubie's transform, tagged with its home grid key so colours rebuild right. */
export interface CubieSnapshot {
  /** Original `${gx},${gy},${gz}` grid key — identifies the cubie's sticker set. */
  home: string;
  position: [number, number, number];
  quaternion: [number, number, number, number];
}

/** Camera view captured so the user's orientation is preserved too. */
export interface CameraSnapshot {
  position: [number, number, number];
  up: [number, number, number];
  target: [number, number, number];
}

export interface CubeSnapshot {
  cubies: CubieSnapshot[];
  camera: CameraSnapshot;
  solveInfo: string;
}

/**
 * Holds the Rubik's cube state across route changes. The component is destroyed
 * on navigation, but this root-provided service lives on, so the scramble and
 * camera angle are restored when the user comes back.
 */
@Injectable({providedIn: 'root'})
export class RubiksStateService {
  private _snapshot: CubeSnapshot | null = null;

  save(snapshot: CubeSnapshot): void {
    this._snapshot = snapshot;
  }

  load(): CubeSnapshot | null {
    return this._snapshot;
  }

  clear(): void {
    this._snapshot = null;
  }
}
