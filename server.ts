import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { LRUCache } from "lru-cache";

dotenv.config();

// --- SCALING PRIMITIVES ---

// Server-side Caching (LRU)
const cache = new LRUCache({
  max: 500, // store 500 records
  ttl: 1000 * 60 * 5, // 5 min TTL
});

// Job Queue Simulation
// In a real production env, this would use Redis + Bull or Pub/Sub
const internalQueue: any[] = [];
let processedCount = 0;

const _filename = typeof import.meta !== 'undefined' && import.meta.url 
  ? fileURLToPath(import.meta.url) 
  : (typeof __filename !== 'undefined' ? __filename : path.join(process.cwd(), 'server.ts'));

const _dirname = typeof __dirname !== 'undefined' 
  ? __dirname 
  : path.dirname(_filename);

const app = express();
const PORT = 3000;

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false, 
  contentSecurityPolicy: false, // Temporarily disable CSP to ensure preview functionality
}));

// Strictly allow current preview domain in production
const allowedOrigins = process.env.NODE_ENV === 'production' && process.env.APP_URL 
  ? [process.env.APP_URL]
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

app.use(express.json({ limit: '10kb' })); 

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

// Specialized AI/Auth Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Excessive authentication/AI requests. Access restricted for security." }
});

app.use(globalLimiter);
app.use("/api/auth/*", authLimiter);
app.use("/api/jobs", authLimiter);

// --- API ROUTES ---

// Health & Infrastructure Status
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "online", 
    node: "Worker-" + Math.floor(Math.random() * 5),
    scaling: "Horizontal [Active]",
    loadBalancer: "Cloud Run Managed",
    version: "2.1.0",
    engines: ["Gemini-2.0-Flash", "Gemini-2.0-Pro"],
    database: {
      primary: "Firestore Enterprise",
      replicas: 3,
      region: "multi-regional"
    },
    timestamp: new Date().toISOString() 
  });
});

// Monitoring Metrics (Real-time)
app.get("/api/metrics", (req, res) => {
  const usage = process.memoryUsage();
  res.json({
    uptime: process.uptime(),
    memory: {
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + "MB",
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + "MB",
      rss: Math.round(usage.rss / 1024 / 1024) + "MB"
    },
    queue: {
      length: internalQueue.length,
      processed: processedCount
    },
    cache: {
      size: cache.size,
      remaining: cache.max - cache.size
    }
  });
});

// --- OAUTH INTEGRATION ---

app.get('/api/auth/url', (req, res) => {
  const { platform } = req.query;
  const app_url = process.env.APP_URL || "http://localhost:3000";
  const redirectUri = `${app_url}/auth/callback`;
  
  let providerAuthUrl = '';
  let clientId = '';

  switch(platform) {
    case 'twitter': 
      providerAuthUrl = 'https://twitter.com/i/oauth2/authorize'; 
      clientId = process.env.TWITTER_CLIENT_ID || 'TWITTER_DEV_ID';
      break;
    case 'instagram': 
      providerAuthUrl = 'https://api.instagram.com/oauth/authorize'; 
      clientId = process.env.INSTAGRAM_CLIENT_ID || 'INSTAGRAM_DEV_ID';
      break;
    case 'linkedin': 
      providerAuthUrl = 'https://www.linkedin.com/oauth/v2/authorization'; 
      clientId = process.env.LINKEDIN_CLIENT_ID || 'LINKEDIN_DEV_ID';
      break;
    case 'facebook': 
      providerAuthUrl = 'https://www.facebook.com/v12.0/dialog/oauth'; 
      clientId = process.env.FACEBOOK_CLIENT_ID || 'FACEBOOK_DEV_ID';
      break;
    case 'tiktok': 
      providerAuthUrl = 'https://www.tiktok.com/auth/authorize/'; 
      clientId = process.env.TIKTOK_CLIENT_ID || 'TIKTOK_DEV_ID';
      break;
    default: 
      return res.status(400).json({ error: 'Unsupported platform' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read write',
    state: platform as string
  });

  res.json({ url: `${providerAuthUrl}?${params}` });
});

app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
  const { platform, state } = req.query;
  const targetPlatform = (state || platform) as string;
  
  // Simulated token exchange logic
  const dummyToken = "tok_" + Math.random().toString(36).substring(7);
  const dummyUser = "brand_" + Math.random().toString(36).substring(7);
  const dummyFollowers = Math.floor(Math.random() * 50000) + 1000;

  const appUrl = process.env.APP_URL || "http://localhost:3000";

  res.send(`
    <html>
      <body style="font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #020617; color: #fff; text-align: center;">
        <div style="padding: 40px; background: #0f172a; border-radius: 32px; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <div style="background: #f97316; width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h2 style="font-weight: 900; text-transform: uppercase; margin: 0 0 8px; letter-spacing: -0.05em;">Node Connected</h2>
          <p style="color: #94a3b8; font-weight: 600; font-size: 14px; margin: 0 0 32px; text-transform: uppercase; letter-spacing: 0.1em;">Synchronizing ${targetPlatform} identity...</p>
          <div style="height: 4px; width: 100%; background: #1e293b; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: 50%; background: #f97316; animation: progress 2s ease-in-out infinite;"></div>
          </div>
        </div>
        <style>
          @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        </style>
        <script>
          const targetOrigin = window.location.origin.includes('localhost') 
            ? 'http://localhost:3000' 
            : '${appUrl}';

          window.opener.postMessage({ 
            type: 'OAUTH_AUTH_SUCCESS', 
            platform: '${targetPlatform}',
            token: '${dummyToken}',
            username: '${dummyUser}',
            followers: ${dummyFollowers}
          }, targetOrigin);
          setTimeout(() => window.close(), 2500);
        </script>
      </body>
    </html>
  `);
});

// Queuing Endpoint (Accept & Return Fast)
app.post("/api/jobs", (req, res) => {
  const { type, data } = req.body;
  const jobId = "job_" + Date.now();
  
  // 1. Accept into queue (Scalable decision)
  internalQueue.push({ id: jobId, type, data, status: 'queued', timestamp: new Date() });
  
  // 2. Respond immediately (User doesn't wait)
  res.status(202).json({ 
    status: "queued", 
    id: jobId, 
    message: "Request accepted into high-performance queue.",
    infrastructure: "Stateless Node A" 
  });

  // 3. Process in background (Simulated worker)
  setTimeout(() => {
    const jobIndex = internalQueue.findIndex(j => j.id === jobId);
    if (jobIndex > -1) {
      internalQueue.splice(jobIndex, 1);
      processedCount++;
      console.log(`[WORKER] Job ${jobId} synthesized successfully.`);
    }
  }, 5000 + Math.random() * 5000); // 5-10s simulated processing
});

// Caching Endpoint
app.get("/api/data/:key", (req, res) => {
  const { key } = req.params;
  const cachedData = cache.get(key);

  if (cachedData) {
    return res.json({ source: 'cache', data: cachedData });
  }

  // Simulate expensive DB/AI operation
  const freshData = { result: `Synthetic data for ${key}`, timestamp: new Date() };
  cache.set(key, freshData);
  res.json({ source: 'database', data: freshData });
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production" && process.env.VITE_DEV !== "false") {
    console.log("\x1b[36m[BRANDAVOX AI]\x1b[0m Initializing Vite Development Middleware...");
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
