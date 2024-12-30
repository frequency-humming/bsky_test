import cors from '@fastify/cors';
import Fastify, {FastifyInstance} from 'fastify';
import { createDb, migrateToLatest } from './db.js';
import { env } from './lib/env.js';
import {createBidirectionalResolver, createClient, createIdResolver} from './client.js';
import routes from './routes/routes.js';
import fastifyWebsocket from '@fastify/websocket';


const fastify: FastifyInstance = Fastify({logger: false});
fastify.register(fastifyWebsocket);

fastify.register(cors, {
  origin: 'http://127.0.0.1:3000', 
  methods: ['GET','POST'],
  credentials: true,
});

//let ingester = Firehose;
const { NODE_ENV, HOST, PORT, DB_PATH } = env
let db = createDb(DB_PATH);
await migrateToLatest(db);
let oauthClient = await createClient(db);
const baseIdResolver = createIdResolver();
const resolver = createBidirectionalResolver(baseIdResolver);
//const { firehose, eventEmitter } = createIngester(db, baseIdResolver);
//firehose.start();

fastify.register(routes, {oauthClient,db, baseIdResolver,resolver});

const start = async () => {
  try {
    await fastify.listen({port: 3001, host: '127.0.0.1'});
    fastify.log.info(`Server running at http://127.0.0.1:3001/`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();