import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    proxy: {
      "/send.php": "http://127.0.0.1:8000",
    },
  },
  preview: {
    host: "127.0.0.1",
  },
});
