import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Plugin para copiar y versionar Service Worker
        {
          name: 'inject-sw-version',
          closeBundle() {
            const swSourcePath = path.resolve(__dirname, 'public/sw.js');
            const swDestPath = path.resolve(__dirname, 'dist/sw.js');
            
            // Copiar sw.js de public/ a dist/
            if (fs.existsSync(swSourcePath)) {
              let content = fs.readFileSync(swSourcePath, 'utf-8');
              const timestamp = Date.now();
              
              // Reemplazar el placeholder con el timestamp
              content = content.replace('__BUILD_TIMESTAMP__', timestamp.toString());
              
              // Escribir en dist/
              fs.writeFileSync(swDestPath, content);
              console.log(`\n✅ Service Worker copiado y versionado: ${timestamp}`);
              console.log(`   Cache name: tribu-impulsa-${timestamp}\n`);
            } else {
              console.error('❌ Service Worker no encontrado en public/sw.js');
            }
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
