import type { NodeOAuthClient } from '@atproto/oauth-client-node';
import type { Database } from '../db.js';
import { IdResolver } from '@atproto/identity';

export interface TimelineQuery {
  cursor?: string;
}

export type Session = { 
  did: string 
}

export type RouteDependencies = {
  oauthClient: NodeOAuthClient;
  db: Database;
  baseIdResolver: IdResolver;
  resolver: any;
};