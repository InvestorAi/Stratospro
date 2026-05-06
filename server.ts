import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock Invoice Generation Endpoint
  app.post("/api/invoices", (req, res) => {
    const { clientEmail, amount, services } = req.body;
    // In a real app, this would generate a PDF on server or store in DB
    console.log(`Generating invoice for ${clientEmail}: ${amount}`);
    res.json({ success: true, invoiceId: Date.now().toString() });
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.log("Starting Vite in middleware mode...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");

      // SPA fallback for dev
      app.get("*", async (req, res, next) => {
        const url = req.originalUrl;
        try {
          // 1. Read index.html
          let template = await fs.promises.readFile(path.resolve(__dirname, "index.html"), "utf-8");
          // 2. Apply Vite HTML transforms
          template = await vite.transformIndexHtml(url, template);
          // 3. Send back the rendered HTML
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
    } catch (e) {
      console.error("Failed to start Vite server:", e);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
