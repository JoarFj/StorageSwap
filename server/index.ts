import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static path setup
const staticPath = path.resolve(__dirname, '../dist');

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Check if we're in production mode with built assets
if (process.env.NODE_ENV === 'production' && fs.existsSync(staticPath)) {
  console.log('Serving static files from:', staticPath);
  
  // Serve static files from the built app
  app.use(express.static(staticPath));
  
  // Handle SPA routing - send all requests to the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // In development, just serve API endpoints
  console.log('Running in development mode without static files');
  
  // Fallback route for non-API routes in development
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(200).send(`
        <html>
          <head><title>API Server</title></head>
          <body>
            <h1>API Server Running</h1>
            <p>This is a development environment. API endpoints are available at /api/*</p>
            <p>To access the frontend, run the build process or start the frontend development server.</p>
            <p><a href="/api/health">Check API Health</a></p>
          </body>
        </html>
      `);
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;