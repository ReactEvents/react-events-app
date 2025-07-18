import { Plugin } from 'vite';
// import fs from 'fs';
import path from 'path';
import babel from '@rollup/plugin-babel'
// import { retrieveFetchData } from '../runtime/retrieveFetchData';

import renameFetch from '../babel-plugins/renameFetch.js';

export function fetchPlugin(): Plugin {
  console.log('*****ENTERING PLUGIN******');
  // Returns a Vite-compatible plugin object
  // can be imported to vite.config.ts as reactEventsPlugin()
  return {
    name: 'vite-plugin-fetchPlugin', // plugin name
    enforce: 'pre', // specifies that this plugin will run before all other vite build logic
    apply: 'serve', // This ensures the plugin only runs during development

    resolveId(id) {
      // anywhere retrieveFetchData is added -> adding an explicit path
      // so user can use import { retrieveFetchData } from 'retrieveFetchData' --> creating an alias
      if (id === 'retrieveFetchData') {
        return path.resolve(__dirname, '../runtime/retrieveFetchData.ts');
      }
    },

    //https://rollupjs.org/plugin-development/#transform
    async transform(code, id) {
      console.log('[plugin] transforming received:', id);
      // ignore all files that don't end in .js .jsx .ts .tsx
      //or have already been transformed
      if (
        id.includes('node_modules') ||
        id.includes('retrieveFetchData.ts') ||
        id.includes('retrieveFetchData.js') ||  // add this
        !/\.(jsx?|tsx?)$/.test(id)
      ) {
        return null;
      }
      if (code.includes('fetch(')) {
        console.log(`[plugin] ${id} contains fetch calls, transforming...`)
      }
      

      // Use Babel to transform the code with the renameFetch plugin
      const babel = await import('@babel/core');
      const jsxSyntax = (await import('@babel/plugin-syntax-jsx')).default;
      const result = await babel.transformAsync(code, {
        filename: id,
        plugins: [jsxSyntax, renameFetch],
        sourceMaps: true,
        configFile: false,
      });
      console.log('*this is the result.code', result.code)
      // Return the transformed code and map (if available)
      if (result && result.code) {
        console.log(
          '********** code transformed in some way!!!! from index ',
          result.code
        );
        return {
          code: result.code,
          map: result.map || null,
        };
      }
      return null;
    },

    //https://vite.dev/guide/api-plugin.html#configresolved
    configResolved(config) {
      // This hook runs after Vite has resolved the final config
      // Logs the current mode (development, production, etc.), confirming the plugin is active
      console.log('ReactEvents plugin active in:', config);
    },
  };
}
