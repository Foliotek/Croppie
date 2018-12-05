import { rollup } from 'rollup';
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript');

const build = async () => {
  const buildEsm2015 = async () => {
    const esm2015Bundle = rollup({
      input: 'src/index.ts',
      plugins: [typescript()]
    });
    return (await esm2015Bundle).write({
      file: 'dist/esm2015/croppie.js',
      format: 'esm',
      sourcemap: true
    });
  };

  const buildEsm5 = async () => {
    const esm5Bundle = rollup({
      input: 'src/index.ts',
      plugins: [
        typescript({
          target: 'es5',
          declaration: false
        })
      ]
    });
    return (await esm5Bundle).write({
      file: 'dist/esm5/croppie.js',
      format: 'esm',
      sourcemap: true
    });
  };

  const buildUmd = async () => {
    const umdBundle = rollup({
      input: 'src/index.ts',
      plugins: [
        typescript({
          target: 'es5'
        })
      ]
    });
    return (await umdBundle).write({
      file: 'dist/bundles/croppie.js',
      format: 'umd',
      sourcemap: true,
      name: 'Croppie'
    });
  };

  const buildUmdMinified = async () => {
    const umdMinifiedBundle = rollup({
      input: 'src/index.ts',
      plugins: [
        typescript({
          target: 'es5'
        }),
        terser()
      ]
    });
    return (await umdMinifiedBundle).write({
      file: 'dist/bundles/croppie.min.js',
      format: 'umd',
      sourcemap: true,
      name: 'Croppie'
    });
  };

  await buildEsm2015();
  await buildEsm5();
  await buildUmd();
  await buildUmdMinified();
};

build().then((_) => console.log('Done'));
