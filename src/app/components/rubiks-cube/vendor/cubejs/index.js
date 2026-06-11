// Vendored from cubejs@1.3.2 (MIT — see ./LICENSE).
//
// Why vendored: the published cubejs package declares a bogus runtime
// dependency on the `npm` CLI (`"npm": "^6.0.0"`) that it never imports, which
// pulled npm@6's entire vulnerable package tree into node_modules. cubejs's own
// code is self-contained (only requires ./cube), so inlining the two source
// files removes that dependency at the root — no overrides, no install hooks,
// no unmaintained package. We use the cube model + precomputed move/pruning
// tables; the length-minimising search lives in ../../solver.worker.ts.
module.exports = require('./cube');
require('./solve');
