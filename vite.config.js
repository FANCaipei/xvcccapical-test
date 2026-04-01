import { defineConfig } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const css_to_js_plugin = () => {
  return {
    name: 'css-to-js-plugin',
    configResolved: (config) => {
      const css_path = resolve(config.root, 'src/v-scroll.css'),
            js_target_path = resolve(config.root, 'src/theme/v-scroll.js');
      
      if (!existsSync(css_path)) {
        console.warn(`[css-to-js-plugin] ${css_path} not found.`);
        return;
      }

      const css_content = readFileSync(css_path, 'utf-8');
      
      // Basic compression: remove comments and whitespace
      const compressed_css = css_content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ')            // Replace multiple whitespace with single space
        .trim();

      const js_content = `export default \`${compressed_css}\`;`;
      
      const target_dir = resolve(config.root, 'src/theme');
      if (!existsSync(target_dir)) {
        mkdirSync(target_dir, { recursive: true });
      }
      
      writeFileSync(js_target_path, js_content, 'utf-8');
      console.log(`[css-to-js-plugin] Generated ${js_target_path}`);
    }
  };
};

export default defineConfig({
  plugins: [css_to_js_plugin()],
  resolve: {
    alias: {
      '$': resolve(process.cwd(), 'src/theme')
    }
  },
  server: {
    port: 3000
  }
});
