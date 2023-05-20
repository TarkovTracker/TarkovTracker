import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";
import vueI18n from "@intlify/vite-plugin-vue-i18n";
import vuetify from "vite-plugin-vuetify";
import firebasePlugin from "vite-plugin-firebase";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    vue(),
    eslintPlugin(),
    vueI18n({
      include: path.resolve(__dirname, "./src/locales/**"),
    }),
    vuetify({ autoImport: true }),
    firebasePlugin({
      // mandatory firebase project id
      projectId: "tarkovtracker-next",
      // project directory, i.e. where firebase.json is (defaults to `config.root`)
      root: path.resolve("../"),
      // whether to materialize (write on disk) `.runtimeconfig.json` for functions emulator (defaults to `false`)
      materializeConfig: false,
      // emulator targets (defaults to `['hosting', 'functions']`)
      targets: [
        "hosting",
        "functions",
        "firestore",
        "database",
        "auth",
        "ui",
        "pubsub",
      ],
      // show UI
      showUI: true,
    }),
  ],
});
