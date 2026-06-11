/// <reference lib="webworker" />
/**
 * Length-minimising Kociemba two-phase solver, run in a worker.
 *
 * cubejs ships a correct two-phase solver, but it returns the *first* solution
 * it finds, which is heavily padded for shallow scrambles (a single R comes back
 * as ~8 moves). We reuse cubejs's MIT-licensed cube model and precomputed
 * move/pruning tables, but run our own search that minimises the *total* move
 * count: it keeps improving until phase 1 alone can no longer beat the best
 * solution, or a small time budget elapses. A one-move scramble now solves in
 * one move, and the first (correct) solution is always found within a few ms,
 * so the time budget only ever trades latency for a shorter solution.
 *
 * Running here keeps the ~2s one-off table build (and the search) off the UI
 * thread.
 */
// @ts-expect-error vendored cubejs (plain JS, no type declarations); typed below.
import CubeImport from './vendor/cubejs';

/** A cube instance — the slice of cubejs's API we use. */
interface CubeModel {
  move(alg: string): CubeModel;
  upright(): string;
  center: number[];
  flip(): number;
  twist(): number;
  FRtoBR(): number;
  cornerParity(): number;
  URFtoDLF(): number;
  URtoUL(): number;
  UBtoDF(): number;
}
/** The cubejs default export (constructor + statics). */
interface CubeCtor {
  new (): CubeModel;
  fromString(facelets: string): CubeModel;
  initSolver(): void;
  moveTables: Record<string, number[][]>;
  pruningTables: Record<string, number[]>;
}
const Cube = CubeImport as CubeCtor;

export interface SolveRequest {
  facelets: string;
}
export interface SolveResponse {
  solution?: string;
  error?: string;
}

// Coordinate space sizes (see cubejs/lib/solve.js).
const N_SLICE1 = 495;
const N_SLICE2 = 24;
const N_PARITY = 2;

// Move indices: face * 3 + power, faces U R F D L B, powers 1/2/3 turns.
const allMoves1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
// Phase 2 allows only U, D quarter turns plus double turns of every face.
const allMoves2 = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16];

// Valid follow-up moves per last face, avoiding redundant/commuting sequences.
const nextMoves1: number[][] = [];
const nextMoves2: number[][] = [];
for (let last = 0; last < 6; last++) {
  const n1: number[] = [];
  const n2: number[] = [];
  for (let face = 0; face < 6; face++) {
    if (face !== last && face !== last - 3) {
      for (let power = 0; power < 3; power++) n1.push(face * 3 + power);
      const powers = face === 0 || face === 3 ? [0, 1, 2] : [1];
      for (const power of powers) n2.push(face * 3 + power);
    }
  }
  nextMoves1.push(n1);
  nextMoves2.push(n2);
}

const POWER_NAME = ['', '2', "'"];

let ready = false;
let MT: Record<string, number[][]>;
let PT: Record<string, number[]>;

const init = (): void => {
  if (ready) return;
  Cube.initSolver();
  MT = Cube.moveTables;
  PT = Cube.pruningTables;
  ready = true;
};

/** Read a packed 4-bit pruning value. */
const pru = (table: number[], index: number): number =>
  (table[index >> 3] >>> ((index & 7) << 2)) & 0xf;

/** Lower bound on remaining phase 1 moves. */
const dist1 = (flip: number, twist: number, slice: number): number =>
  Math.max(
    pru(PT['sliceFlip'], N_SLICE1 * flip + slice),
    pru(PT['sliceTwist'], N_SLICE1 * twist + slice),
  );

/** Lower bound on remaining phase 2 moves. */
const dist2 = (urToDf: number, frToBr: number, parity: number, urfToDlf: number): number =>
  Math.max(
    pru(PT['sliceURtoDFParity'], (N_SLICE2 * urToDf + frToBr) * N_PARITY + parity),
    pru(PT['sliceURFtoDLFParity'], (N_SLICE2 * urfToDlf + frToBr) * N_PARITY + parity),
  );

/**
 * Solve a cube given its 54-char URFDLB facelet string. Returns a minimal-ish
 * solution in standard notation (e.g. "U R U' R'"), or "" if already solved.
 */
function solve(facelets: string, maxDepth = 22, timeLimitMs = 800): string {
  init();

  // Re-orient so the centres are standard, then map the solution back.
  const cube = Cube.fromString(facelets);
  const upright = cube.upright();
  cube.move(upright);
  const rotation = new Cube().move(upright).center;

  const path1: number[] = [];
  const path2: number[] = [];
  let best: number[] | null = null;
  let bestLen = maxDepth + 1;
  let aborted = false;
  const deadline = Date.now() + timeLimitMs;

  const mv = (table: string, index: number, move: number): number => MT[table][index][move];

  const search2 = (
    frToBr: number, parity: number, urfToDlf: number, urToDf: number,
    lastMove: number | null, depth: number,
  ): boolean => {
    if (depth === 0) return dist2(urToDf, frToBr, parity, urfToDlf) === 0;
    if (dist2(urToDf, frToBr, parity, urfToDlf) > depth) return false;
    const moves = lastMove === null ? allMoves2 : nextMoves2[(lastMove / 3) | 0];
    for (const m of moves) {
      path2.push(m);
      if (search2(
        mv('FRtoBR', frToBr, m), mv('parity', parity, m),
        mv('URFtoDLF', urfToDlf, m), mv('URtoDF', urToDf, m), m, depth - 1,
      )) return true;
      path2.pop();
    }
    return false;
  };

  const tryPhase2 = (
    frToBr: number, parity: number, urfToDlf: number,
    urToUl: number, ubToDf: number, p1Last: number | null,
  ): void => {
    const len1 = path1.length;
    if (len1 >= bestLen) return;
    const urToDf = mv('mergeURtoDF', urToUl, ubToDf);
    const budget = bestLen - 1 - len1;
    for (let d = dist2(urToDf, frToBr, parity, urfToDlf); d <= budget; d++) {
      path2.length = 0;
      if (search2(frToBr, parity, urfToDlf, urToDf, p1Last, d)) {
        bestLen = len1 + d;
        best = [...path1, ...path2];
        return;
      }
    }
  };

  const search1 = (
    flip: number, twist: number, frToBr: number, parity: number,
    urfToDlf: number, urToUl: number, ubToDf: number,
    lastMove: number | null, depth: number,
  ): void => {
    if (aborted) return;
    if (best !== null && Date.now() > deadline) {
      aborted = true;
      return;
    }
    const slice = (frToBr / N_SLICE2) | 0;
    if (depth === 0) {
      // In G1: try to finish in phase 2, unless that would repeat the last face.
      if (dist1(flip, twist, slice) === 0 &&
          (lastMove === null || allMoves2.indexOf(lastMove) < 0)) {
        tryPhase2(frToBr, parity, urfToDlf, urToUl, ubToDf, lastMove);
      }
      return;
    }
    if (dist1(flip, twist, slice) > depth) return;
    const moves = lastMove === null ? allMoves1 : nextMoves1[(lastMove / 3) | 0];
    for (const m of moves) {
      path1.push(m);
      search1(
        mv('flip', flip, m), mv('twist', twist, m), mv('FRtoBR', frToBr, m),
        mv('parity', parity, m), mv('URFtoDLF', urfToDlf, m),
        mv('URtoUL', urToUl, m), mv('UBtoDF', ubToDf, m), m, depth - 1,
      );
      path1.pop();
      if (aborted) return;
    }
  };

  const flip = cube.flip();
  const twist = cube.twist();
  const frToBr = cube.FRtoBR();
  const parity = cube.cornerParity();
  const urfToDlf = cube.URFtoDLF();
  const urToUl = cube.URtoUL();
  const ubToDf = cube.UBtoDF();

  // Iterative deepening on phase 1 length; stop once it can't beat the best.
  for (let len1 = dist1(flip, twist, (frToBr / N_SLICE2) | 0); len1 <= maxDepth; len1++) {
    path1.length = 0;
    search1(flip, twist, frToBr, parity, urfToDlf, urToUl, ubToDf, null, len1);
    if (aborted || bestLen <= len1 + 1) break;
  }

  if (!best) return '';
  const names = ['U', 'R', 'F', 'D', 'L', 'B'];
  return (best as number[])
    .map((m) => names[rotation[(m / 3) | 0]] + POWER_NAME[m % 3])
    .join(' ');
}

addEventListener('message', ({data}: MessageEvent<SolveRequest>) => {
  let response: SolveResponse;
  try {
    response = {solution: solve(data.facelets)};
  } catch (err) {
    response = {error: String(err)};
  }
  postMessage(response);
});
