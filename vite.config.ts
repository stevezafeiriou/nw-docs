import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		include: ["react", "react-dom", "react-router-dom"],
	},
	build: {
		target: "es2022",
		sourcemap: false,
		chunkSizeWarningLimit: 400,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("react-markdown") || id.includes("remark-gfm")) {
						return "markdown";
					}

					if (id.includes("react-icons")) {
						return "icons";
					}

					if (id.includes("node_modules/react")) {
						return "react-vendor";
					}
				},
			},
		},
	},
});
