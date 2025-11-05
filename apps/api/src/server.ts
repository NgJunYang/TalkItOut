import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { setupSocketIO } from './services/socket';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Setup Socket.IO
    const io = setupSocketIO(httpServer);

    // Make io available to routes if needed
    app.set('io', io);

    // Start server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════╗
║                                        ║
║      🎯 TalkItOut API Server          ║
║                                        ║
║  Status: Running                       ║
║  Port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  Socket.IO: Enabled                    ║
║                                        ║
╚════════════════════════════════════════╝
      `);
    });

    // Handle server errors
    httpServer.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
