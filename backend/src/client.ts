import {FastifyReply, FastifyRequest} from 'fastify';
import { NodeOAuthClient } from '@atproto/oauth-client-node';
import { getIronSession } from 'iron-session';
import { StateStore, SessionStore } from './store.js';
import type { Database } from './db.js';
import { env } from './lib/env.js';
import { Agent } from '@atproto/api';
import { IdResolver, MemoryCache } from '@atproto/identity';
import { Firehose } from '@atproto/sync';
import type {Session} from './types/types.js';
import { EventEmitter } from 'events';

const HOUR = 60e3 * 60;
const DAY = HOUR * 24;

const eventEmitter = new EventEmitter();

export function createIdResolver() {
  return new IdResolver({
    didCache: new MemoryCache(HOUR, DAY),
  })
}

export async function getSessionAgent(req: FastifyRequest, rep: FastifyReply, oauthClient:any) {
    const session = await getIronSession<Session>(req.raw, rep.raw, {
      cookieName: 'sid',
      password: env.COOKIE_SECRET,
    });
    if (!session.did) return null;
    try {
      const oauthSession = await oauthClient.restore(session.did);
      return oauthSession ? new Agent(oauthSession) : null;
    } catch (err) {
      req.log.warn({ err }, 'OAuth restore failed');
      await session.destroy();
      return null;
    }
  }

export const createClient = async (db: Database) => {
    const publicUrl = env.PUBLIC_URL
    const url = publicUrl || `http://127.0.0.1:${env.PORT}`
    const enc = encodeURIComponent
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: 'AT Protocol Express App',
      client_id: publicUrl
        ? `${url}/client-metadata.json`
        : `http://localhost?redirect_uri=${enc(`${url}/oauth/callback`)}&scope=${enc('atproto transition:generic')}`,
      client_uri: url,
      redirect_uris: [`${url}/oauth/callback`],
      scope: 'atproto transition:generic',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      application_type: 'web',
      token_endpoint_auth_method: 'none',
      dpop_bound_access_tokens: true,
    },
    stateStore: new StateStore(db),
    sessionStore: new SessionStore(db),
  })
}

// export function createIngester(db: Database, idResolver: IdResolver) {
//   return new Firehose({
//     idResolver,
//     handleEvent: async (evt) => {
//       // Watch for write events
//       if(evt.event === 'create'){
//         await console.log(" in websocket "+JSON.stringify(evt));
//       }
          
//     },
//     onError: (err) => {
//       console.error({ err }, 'error on firehose ingestion')
//     },
//     filterCollections: ['app.bsky.feed.post'],
//   })
// }

export function createIngester(db: Database, idResolver: IdResolver) {
  const firehose = new Firehose({
    idResolver,
    handleEvent: async (evt) => {
      if (evt.event === 'create' && evt.record.text && evt.record.langs && (evt.record.langs as string[]).includes('en')) {
        //console.log("In WebSocket: ", JSON.stringify(evt));
        eventEmitter.emit('event', JSON.stringify(evt.record.text)); // Emit event to listeners
      }
    },
    onError: (err) => {
      console.error({ err }, 'Error on Firehose ingestion');
    },
    filterCollections: ['app.bsky.feed.post'],
  });

  return {firehose,eventEmitter,}; // Return the event emitter with the ingester
}

export interface BidirectionalResolver {
  resolveDidToHandle(did: string): Promise<string>
  resolveDidsToHandles(dids: string[]): Promise<Record<string, string>>
}

export function createBidirectionalResolver(resolver: IdResolver) {
  return {
    async resolveDidToHandle(did: string): Promise<string> {
      const didDoc = await resolver.did.resolveAtprotoData(did)
      const resolvedHandle = await resolver.handle.resolve(didDoc.handle)
      if (resolvedHandle === did) {
        return didDoc.handle
      }
      return did
    },

    async resolveDidsToHandles(
      dids: string[]
    ): Promise<Record<string, string>> {
      const didHandleMap: Record<string, string> = {}
      const resolves = await Promise.all(
        dids.map((did) => this.resolveDidToHandle(did).catch((_) => did))
      )
      for (let i = 0; i < dids.length; i++) {
        didHandleMap[dids[i]] = resolves[i]
      }
      return didHandleMap
    },
  }
}