import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vite dev mode
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Rate Limiting
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute for free users (simplified)
  message: { error: "Neural Engine Rate Limit Exceeded. Upgrade to Pro for 300/min." },
  standardHeaders: true,
  legacyHeaders: false,
});

// DeepSeek Client (initialized lazily)
let deepseekClient: OpenAI | null = null;
const getDeepSeek = () => {
  if (!deepseekClient) {
    const apiKey = process.env.DEEPSEEK_API_KEY || "sk-dummy"; // Allow boot, fail on use
    deepseekClient = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
  }
  return deepseekClient;
};

// --- API ROUTES ---

app.post("/api/proxy/deepseek", aiLimiter, async (req, res) => {
  try {
    const { model, messages } = req.body;
    const client = getDeepSeek();

    // DeepSeek API specific: Reasoner requires different handling if used,
    // but standard chat works with chat.completions.
    const response = await client.chat.completions.create({
      model: model || "deepseek-chat",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    res.json(response.choices[0].message);
  } catch (error: any) {
    console.error("DeepSeek Proxy Error:", error);
    res.status(500).json({ error: error.message || "Neural Engine Failure" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "online", 
    service: "BRANDAVOX-CORE", 
    engines: ["DeepSeek-V3", "DeepSeek-VL"],
    security: "Helmet+CORS+E2E",
    timestamp: new Date().toISOString() 
  });
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\x1b[35m[BRANDAVOX AI]\x1b[0m Server running on http://localhost:${PORT}`);
  });
}

startServer();
