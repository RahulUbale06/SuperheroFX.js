
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.js",
            name: "SuperheroFX",
            formats: ["es", "umd"],
            fileName: (format) =>
                format === "es"
                    ? "superhero-fx.js"
                    : "superhero-fx.umd.cjs"
        },

        rollupOptions: {
            external: ["gsap"],
            output: {
                globals: {
                    gsap: "gsap"
                }
            }
        }
    }
});
