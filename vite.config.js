import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    // Use `oxc` protocolRange (new API) so the esbuild-deprecation warning disappears.
    // `protocolImports: true` ensures node: protocol imports work in LangChain.
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'util', 'events'],
      globals: { Buffer: true, process: true, global: true },
      protocolImports: true,
    }),
  ],

  optimizeDeps: {
    include: [
      '@langchain/core', '@langchain/openai', '@langchain/community',
      'react-is', 'recharts', 'chart.js', 'react-chartjs-2', 'three',
      'react-markdown', 'framer-motion', 'lucide-react',
      'jspdf', 'html2canvas',
    ],
  },

  build: {
    target: 'es2022',
    commonjsOptions: {
      include: [/react-is/, /recharts/, /node_modules/],
    },
    // Silence the chunk-size warning (recharts + chart.js are large but tree-shaken)
    chunkSizeWarningLimit: 1000,
  },
})
