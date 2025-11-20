import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

export default defineConfig({
  // ① what to bundle
  entry: [
    'src/index.ts',
    'src/fetchPlugin.ts',
    'src/awaitPlugin.ts',
    'src/useEffectPlugin.ts',
  ],

  // ② output formats
  format: ['esm', 'cjs'],

  // ③ generate *.d.ts for consumers
  dts: true,

  // ④ node target (affects down‑leveling)
  target: 'node18',

  // ⑤ leave these deps unbundled (external means they won't be bundled)
  external: [
    'vite',
    '@babel/core',
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-syntax-typescript',
    'fs',
    'path',
  ],
  
  tsconfig: 'tsconfig.json',

  //⑥ run after build succeeds
  async onSuccess() {
    const files = ['retrieveFetchData.ts', 'retrieveAwaitData.ts','retrieveUseEffectData.ts'];
    const srcDir = path.resolve('runtime');
    const destDir = path.resolve('dist/runtime');
    fs.mkdirSync(destDir, { recursive: true });

    for (const file of files) {
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file.replace('.ts', '.js'));

      const { code } = esbuild.transformSync(fs.readFileSync(src, 'utf8'), {
        loader: 'ts',
        format: 'esm',
        target: 'es2020',
      });

      fs.writeFileSync(dest, code);
      console.log(`transpiled ${file} → dist/runtime ✅`);
    }
  },
});
