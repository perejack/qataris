import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { pathToFileURL } from "url";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "local-api-handlers",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url) return next();

          const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
          if (!url.pathname.startsWith("/api/")) return next();

          const endpoint = url.pathname.replace(/^\/api\//, "");
          const handlerPath = path.join(__dirname, "api", `${endpoint}.js`);

          let mod: any;
          try {
            mod = await import(`${pathToFileURL(handlerPath).href}?t=${Date.now()}`);
          } catch {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, message: "API route not found" }));
            return;
          }

          const handler = mod?.default;
          if (typeof handler !== "function") {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, message: "Invalid API handler" }));
            return;
          }

          (req as any).query = Object.fromEntries(url.searchParams.entries());

          const method = (req.method || "GET").toUpperCase();
          if (["POST", "PUT", "PATCH"].includes(method)) {
            const chunks: Buffer[] = [];
            req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
            req.on("end", async () => {
              const raw = Buffer.concat(chunks).toString("utf8");
              if (raw.trim().length === 0) {
                (req as any).body = undefined;
              } else {
                try {
                  (req as any).body = JSON.parse(raw);
                } catch {
                  (req as any).body = undefined;
                }
              }

              try {
                await handler(req, res);
              } catch (err: any) {
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                }
                res.end(
                  JSON.stringify({
                    success: false,
                    message: "Unhandled API error",
                    error: err?.message || String(err),
                  }),
                );
              }
            });

            req.on("error", (err: any) => {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: false,
                  message: "Failed to read request body",
                  error: err?.message || String(err),
                }),
              );
            });

            return;
          }

          try {
            await handler(req, res);
          } catch (err: any) {
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
            }
            res.end(
              JSON.stringify({
                success: false,
                message: "Unhandled API error",
                error: err?.message || String(err),
              }),
            );
          }
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
