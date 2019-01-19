const serve = require('rollup-plugin-serve');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const isDev = process.env.DEV;

let plugins = [nodeResolve(), commonjs()];
if (isDev) {
    plugins.push(serve({
        contentBase: '.',
        port: 8000,
        open: true
    }));
}

module.exports = {
    input: 'src/index.js',
    plugins: plugins,
    output: {
        file: 'dist/croppie.js',
        name: 'Croppie',
        format: 'umd'
    }
};
