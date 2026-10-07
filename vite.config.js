import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Плагин для удаления crossorigin атрибутов (для совместимости с file://)
function removeCrossOrigin() {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html) {
      return html.replace(/\s+crossorigin/g, '');
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), removeCrossOrigin()],
  base: './',
  build: {
    modulePreload: false,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
