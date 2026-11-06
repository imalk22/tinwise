import { readFileSync } from "node:fs";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const PLACEHOLDER = "https://your-domain.lk";

/** Writes robots.txt and sitemap.xml for the configured site URL, and warns if it's still the placeholder. */
function siteFiles(siteUrl: string): Plugin {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: "tinlanka-site-files",
    apply: "build",
    buildStart() {
      if (siteUrl === PLACEHOLDER) {
        this.warn(`VITE_SITE_URL is still ${PLACEHOLDER}. Set your real domain in .env before deploying, or social previews will break.`);
      }
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>\n</urlset>\n`,
      });
    },
  };
}

/** Reads the "/*" block of public/_headers so `npm run preview` enforces the same headers as production. */
function productionHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  let inBlock = false;
  for (const line of readFileSync("public/_headers", "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      inBlock = line.trim() === "/*";
      continue;
    }
    const i = line.indexOf(":");
    if (inBlock && i > 0) headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return headers;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = (env.VITE_SITE_URL || PLACEHOLDER).replace(/\/$/, "");

  return {
    plugins: [react(), tailwindcss(), siteFiles(siteUrl)],
    preview: { headers: productionHeaders() },
    build: {
      target: "es2022",
      rolldownOptions: {
        output: {
          // Libraries change rarely, so give them their own long-cached chunks.
          codeSplitting: {
            groups: [
              { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
              { name: "motion", test: /node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/ },
              { name: "icons", test: /node_modules[\\/]lucide-react[\\/]/ },
            ],
          },
        },
      },
    },
  };
});
