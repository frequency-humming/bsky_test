import cors from '@fastify/cors';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { createDb, migrateToLatest } from './db.js';
import { env } from './lib/env.js';
import { createBidirectionalResolver, createClient, createIdResolver } from './client.js';
import routes from './routes/routes.js';
import fastifyWebsocket from '@fastify/websocket';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify: FastifyInstance = Fastify({ 
  logger: true,
  maxParamLength: 5000,
});

// Database and client setup
const { DB_PATH } = env;
let db = createDb(DB_PATH);
await migrateToLatest(db);
let oauthClient = await createClient(db);
const baseIdResolver = createIdResolver();
const resolver = createBidirectionalResolver(baseIdResolver);

// Basic plugins
fastify.register(cors, {
  origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
fastify.register(fastifyWebsocket);

// Register your API routes first
fastify.register(async function(fastify) {
  fastify.register(routes, { 
    oauthClient, 
    db, 
    baseIdResolver, 
    resolver,
    prefix: '/api'
  });
});

// Register static file serving
fastify.register(async function(fastify) {
  // Serve Next.js static files
  const staticPath = path.join(__dirname, '../../frontend/.next/static');
  if (fs.existsSync(staticPath)) {
    fastify.register(fastifyStatic, {
      root: staticPath,
      prefix: '/_next/static/',
      decorateReply: false
    });
  }

  // Serve public files
  const publicPath = path.join(__dirname, '../../frontend/public');
  if (fs.existsSync(publicPath)) {
    fastify.register(fastifyStatic, {
      root: publicPath,
      prefix: '/public/',
      decorateReply: false
    });
  }
});

// Catch-all handler for Next.js pages
fastify.register(async function(fastify) {
  const pagesDir = path.join(__dirname, '../../frontend/.next/server/pages');

  fastify.get('/*', async (request, reply) => {
    const url = request.url === '/' ? '/index' : request.url;
    const htmlPath = path.join(pagesDir, `${url}.html`);
    
    try {
      if (fs.existsSync(htmlPath)) {
        const stream = fs.createReadStream(htmlPath);
        reply.type('text/html');
        return reply.send(stream);
      } else {
        // Try to find index.html in the requested directory
        const indexPath = path.join(pagesDir, url, 'index.html');
        if (fs.existsSync(indexPath)) {
          const stream = fs.createReadStream(indexPath);
          reply.type('text/html');
          return reply.send(stream);
        }
      }
      
      // If no specific page is found, serve the main index.html
      const fallbackPath = path.join(pagesDir, 'index.html');
      if (fs.existsSync(fallbackPath)) {
        const stream = fs.createReadStream(fallbackPath);
        reply.type('text/html');
        return reply.send(stream);
      }
      
      reply.code(404).send('Page not found');
    } catch (err) {
      reply.code(500).send('Internal Server Error');
    }
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '127.0.0.1' });
    fastify.log.info(`Server running at http://127.0.0.1:3001/`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();