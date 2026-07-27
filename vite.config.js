import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // hapus semua console.log saat build
        drop_debugger: true,  // hapus semua debugger statement
      },
      format: {
        comments: false,      // hapus semua komentar dari output build
      }
    }
  }
})