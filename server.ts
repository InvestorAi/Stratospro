import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  frameguard: false, // Allow iframe rendering in AI Studio
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:", "https://images.unsplash.com", "https://*.google.com", "https://*.dicebear.com"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.google.com", "https://*.googleapis.com", "https://*.firebaseapp.com", "https://*.gstatic.com"],
      "connect-src": ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "https://*.supabase.co", "wss://*.run.app", "https://*.firebaseapp.com", "https://*.google.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
      "frame-src": ["'self'", "https://*.firebaseapp.com", "https://*.google.com", "https://*.run.app"],
      "frame-ancestors": ["'self'", "https://*.google.com", "https://*.run.app"],
    }
  },
}));

// Strictly allow current preview domain in production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.APP_URL].filter(Boolean) as string[]
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10kb' })); // Mitigate payload size attacks

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use(globalLimiter);

// --- API ROUTES ---

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "online", 
    service: "BRANDAVOX-CORE", 
    engines: ["Gemini-2.0-Flash", "Gemini-2.0-Pro"],
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
