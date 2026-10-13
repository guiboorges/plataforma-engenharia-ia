import { defineConfig } from "vite";

// Em desenvolvimento (npm run dev) o React vem de node_modules.
// No build, o React fica de fora do bundle e é carregado do cdnjs pela página do Artifact
// (ver scripts/build-artifact.mjs), e a app sai num único ficheiro IIFE.
export default defineConfig(({ command }) => ({
  esbuild: {
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
  define: command === "build" ? { "process.env.NODE_ENV": '"production"' } : {},
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: "esbuild",
    lib: {
      entry: "src/main.tsx",
      formats: ["iife"],
      name: "PlataformaIA",
      fileName: () => "app.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM", "react-dom/client": "ReactDOM" },
        assetFileNames: "app.[ext]",
      },
    },
  },
}));
