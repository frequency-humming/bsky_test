import {getSessionAgent} from '../client.js';
import {FastifyInstance} from 'fastify';
import { getIronSession } from 'iron-session';
import type { TimelineQuery } from '../types/types.js';
import { isValidHandle } from '@atproto/syntax';
import { env } from '../lib/env.js';
import type {Session, RouteDependencies} from '../types/types.js'
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs.js';
import {createIngester} from '../client.js';

const activeConnections = new Set<any>(); // Track active connections
let firehose:any;
let eventEmitter:any;

export default async function routes(fastify: FastifyInstance,
    { oauthClient,db,baseIdResolver,resolver}: RouteDependencies){

      fastify.get<{Querystring: TimelineQuery}>('/api/profile/user', async (req, resp) => {
        const agent = await getSessionAgent(req, resp, oauthClient);
        const { handle } = req.query;  // Get handle from query params
                
        if (!agent) {
          return resp.send({url: 'http://127.0.0.1:3000/login'});
        }
      
        try {
          const did = agent.did;
          if(handle && handle.length > 0 && handle != "agent" ){
            const profile = await agent.getProfile({ actor: handle });
            const posts = await agent.getAuthorFeed({ actor: handle });
            return resp.send({ message: profile.data, posts: posts.data.feed, did: did });
          }else if (agent && agent.did && handle === "agent"){
            const profile = await agent.getProfile({ actor: agent.did });
            const posts = await agent.getAuthorFeed({ actor: agent.did });
            return resp.send({ message: profile.data , posts : posts.data.feed, did: did});
          }
        } catch (error) {
          fastify.log.error(error);
          return resp.status(500).send({ error: 'Failed to fetch user profile' });
        }
      });

      fastify.post<{Body: {postUri: string, postCid: string}; Reply:{message: string}}>('/api/postlike', async(req,rep) => {  
        const { postUri, postCid } = req.body;
        const agent = await getSessionAgent(req, rep, oauthClient);
        if (!agent) {
          return rep.status(401).send({ message: 'Unauthorized. Please log in.' });
        }
        try {
          await agent.like(postUri,postCid);
          return rep.send({ message: 'Post liked' });
        } catch (error) {
          return rep.status(500).send({ message: 'Failed to like post' });
        }
      });

      fastify.post<{Body: {follow: string}; Reply:{message: string}}>('/api/follow', async(req,rep) => {  
        const { follow } = req.body;
        const agent = await getSessionAgent(req, rep, oauthClient);
        if (!agent) {
          return rep.status(401).send({ message: 'Unauthorized. Please log in.' });
        }
        try {
          await agent.follow(follow);
          return rep.send({ message: 'User Followed' });
        } catch (error) {
          return rep.status(500).send({ message: 'Failed to like post' });
        }
      });
      
      fastify.post<{ Body: { input: string }; Reply: { message: string } }>('/api/message', async(req, resp)=> {
        const { input } = req.body;
        const agent = await getSessionAgent(req, resp,oauthClient);
        if (!input || !agent) {
         return resp.status(400).send({ message: 'Error submitting post' });
        }
        const post = await agent.post({
          text:input,
          createdAt: new Date().toISOString()
        })
        return { message: post.uri };
      })
      
      fastify.post<{Body: {handle:string}; Reply:{message: string} | {redirect: string}}>('/api/login', async(request,reply)=> {
        const handle = request.body?.handle;
            if (typeof handle !== 'string' || !isValidHandle(handle)) {
              return reply.send({ message: 'invalid handle' })
            }
            // Initiate the OAuth flow
            try {
              const url = await oauthClient.authorize(handle, {
                scope: 'atproto transition:generic',
              })
              return reply.send({redirect:url.toString()});
            } catch (err) {
              return reply.send({message:'oauth authorize failed'});
            }
      })
      
      fastify.get('/oauth/callback', async (req, rep) => {
        const params = new URLSearchParams(req.raw.url?.split('?')[1] || '');
        try {
          const { session } = await oauthClient.callback(params);
          const clientSession = await getIronSession<Session>(req.raw, rep.raw, {
            cookieName: 'sid',
            password: env.COOKIE_SECRET,
          });
          fastify.log.info('Saving session', { did: session.did });
          clientSession.did = session.did;
          await clientSession.save();
          return rep.redirect('/');
        } catch (err) {
          req.log.error({ err }, 'OAuth callback failed');
          return rep.redirect('/?error');
        }
      });

      fastify.get('/', async (req, rep) => {
        const agent = await getSessionAgent(req, rep, oauthClient);
        if (agent) {
          return rep.redirect('http://127.0.0.1:3000/timeline');
        }
        return rep.redirect('http://127.0.0.1:3000/login');
      });
      
      fastify.get<{Querystring: TimelineQuery}>('/api/timeline',async(req, rep):Promise<{ feed: FeedViewPost[]; cursor: string | undefined;did:string | undefined }> => {
        
        const agent = await getSessionAgent(req, rep, oauthClient);
        
        if (!agent) {
          req.log.info('Unauthorized access to /api/timeline');
          return rep.send({ redirect: 'http://127.0.0.1:3000/login' });
        }
        try {
          const did = agent.did;
          const { cursor = "" } = req.query;
          console.log("in server, cursor:", cursor);
          const { data } = await agent.getTimeline({
            cursor,
            limit: 30,
         });
          //console.log(JSON.stringify(data));
          const { feed: postsArray, cursor: nextPage } = data;
          
          return {feed:postsArray,cursor: nextPage, did: did}; 
        } catch (error) {
          return rep.status(500).send({ error: 'Failed to fetch timeline internal' });
        }
      });

      fastify.get('/ws', { websocket: true }, (connection, req) => {
        
        console.log('active connections : '+activeConnections.size);
        activeConnections.add(connection); // Add the connection to the set

        const broadcastEvent = (evt: any) => {
          for (const conn of activeConnections) {
            if (conn.readyState === conn.OPEN) {
              conn.send(evt); // Send event to each connected client
            }
          }
        };

        if(activeConnections.size === 1){
          const ingest = createIngester(db, baseIdResolver);
          firehose = ingest.firehose;
          eventEmitter = ingest.eventEmitter;
          firehose.start();
          eventEmitter.on('event', broadcastEvent);
        }
        connection.on('close', () => {
          console.log('WebSocket client disconnected');  
          activeConnections.delete(connection);
          connection.removeAllListeners();
          if(activeConnections.size < 1){
            firehose.destroy();
            eventEmitter.removeAllListeners();
          }
        });
        connection.on('error', (error) => {
          console.error("WebSocket error:", error);
          connection.close();
        });
          //https://bsky.app/profile/<DID>/post/<RKEY>
          //
          //example: 
          //https://bsky.app/profile/did:plc:blujem75yer4bm7xh7u3t4ak/post/3lcsvstrtwk2n
      });
}