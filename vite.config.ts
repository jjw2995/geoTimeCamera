import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
// import basicSsl from "@vitejs/plugin-basic-ssl";
// https://vitejs.dev/config/
export default defineConfig({
	// server: { https: true },
	plugins: [
		react(),
		// basicSsl(),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: { enabled: true },
			manifest: {
				theme_color: "#ffffff",
				background_color: "#ffffff",
				display: "standalone",
				scope: "/",
				start_url: "/",
				name: "dojo",
				short_name: "dojo",
				icons: [
					{
						src: "/icon-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/icon-256x256.png",
						sizes: "256x256",
						type: "image/png",
					},
					{
						src: "/icon-384x384.png",
						sizes: "384x384",
						type: "image/png",
					},
					{
						src: "/icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
	],
});
