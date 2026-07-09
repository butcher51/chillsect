// ESM shim for p2.js (v0.7.1).
//
// p2's build (node_modules/p2/build/p2.js) is a browserify UMD bundle with no
// ES module build. index.html loads it as a classic <script>, which assigns the
// library to window.p2. This shim re-exports the pieces the game actually uses
// as native ES module bindings, so `import { World, Body, ... } from "p2"`
// (routed here via the import map) keeps working without a bundler.

const p2 = window.p2;

if (!p2) {
	throw new Error(
		"p2 global not found. Ensure node_modules/p2/build/p2.js is loaded via a <script> tag before any module that imports 'p2'."
	);
}

export const { Body, Circle, Convex, World, vec2 } = p2;

export default p2;
