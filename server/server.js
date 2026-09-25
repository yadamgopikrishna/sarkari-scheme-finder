const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting for auth and chat endpoints to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // max 150 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', apiLimiter);
app.use('/api/chat', apiLimiter);

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Root informative landing page for browser visitors on port 5000
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Sarkari Scheme Finder API Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0B2545; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: white; color: #1e293b; padding: 2.5rem; border-radius: 1.25rem; max-width: 520px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 2px solid #E86100; }
          h1 { color: #0B2545; margin-top: 0.5rem; font-size: 1.6rem; font-weight: 800; }
          p { color: #475569; font-size: 0.95rem; line-height: 1.6; }
          .btn { display: inline-block; background: #E86100; color: white; text-decoration: none; padding: 0.85rem 1.8rem; border-radius: 0.75rem; font-weight: 800; font-size: 0.95rem; margin-top: 1.25rem; box-shadow: 0 4px 12px rgba(232, 97, 0, 0.3); transition: all 0.2s; }
          .btn:hover { background: #d05700; transform: translateY(-1px); }
          .status { display: inline-flex; align-items: center; gap: 6px; background: #EAF7EE; color: #107E3E; padding: 0.3rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 800; }
          .dot { width: 8px; height: 8px; background: #107E3E; rounded-full; border-radius: 50%; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="status"><span class="dot"></span> Backend API Running on Port 5000</div>
          <h1>Sarkari Scheme Finder</h1>
          <p>You have accessed the <strong>Backend REST API Server</strong>.</p>
          <p>To use the citizen portal, check eligibility, and explore schemes, please open the React frontend on <strong>port 5173</strong>:</p>
          <a class="btn" href="http://localhost:5173">Open Citizen Web Portal (localhost:5173) &rarr;</a>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sarkari Scheme Finder API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/eligibility', require('./routes/eligibilityRoutes'));
app.use('/api/saved-schemes', require('./routes/savedSchemeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/aiRoutes'));
app.use('/api/meta', require('./routes/metaRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 & Global Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Sarkari Scheme Finder running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  [Port Conflict] Port ${PORT} is already in use by another running process.`);
    console.error(`👉 Solution: Terminate the other process or set a different PORT in server/.env.\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]', err.message);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
});

module.exports = app;
