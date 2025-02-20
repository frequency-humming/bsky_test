import type { NodeOAuthClient } from '@atproto/oauth-client-node';
import type { Database } from '../db.js';
import { IdResolver } from '@atproto/identity';

export interface TimelineQuery {
  cursor?: string;
  handle?: string;
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

interface EmbedImage {
  thumb: string;
  fullsize: string; 
  alt: string; 
  aspectRatio: {
    height: number;
    width: number;
  };
}

interface ExternalContent {
  uri: string;
  title: string;
  description: string;
  thumb: string;
}

interface Embed {
  $type: string; // Type identifier, e.g., "app.bsky.embed.images#view"
  images: EmbedImage[];
  external: ExternalContent;
  playlist: string;
  thumbnail: string;
  aspectRatio:{
    height: number;
    width: number;
  }
}

export interface Post {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName: string;
    avatar: string;
    associated?:{
      chat:{
        allowIncoming: string;
      }
    }
    viewer?:{
      following: string;
    };
    createdAt: string;
  };
  record: {
    $type: string;
    createdAt: string;
    langs?: string[];
    text: string;
    reply?: {
      parent: Record<string, unknown>;
      root: Record<string, unknown>;
    };
  };
  embed?:Embed;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  quoteCount: number;
  indexedAt: string;
  viewer?: Record<string, unknown>;
  labels?: unknown[];
  score?: number;
}

export interface PostWrapper {
  post: Post;
}

export interface TimelineResponse {
  feed: PostWrapper[];
  cursor: string | null;
}