// ESM shim for tween.js (v16.3.5).
//
// tween.js ships only a UMD source with no ES module build. index.html loads it
// as a classic <script>, which assigns the library to window.TWEEN. This shim
// re-exports it as the default binding so `import TWEEN from "tween.js"`
// (routed here via the import map) keeps working without a bundler.

const TWEEN = window.TWEEN;

if (!TWEEN) {
	throw new Error(
		"TWEEN global not found. Ensure node_modules/tween.js/src/Tween.js is loaded via a <script> tag before any module that imports 'tween.js'."
	);
}

export default TWEEN;
