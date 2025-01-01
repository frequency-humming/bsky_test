export interface Profile {
  handle: string;
  displayName: string;
  avatar: string;
  createdAt: string;
  description: string;
  banner: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
}

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

interface Author{
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
}

interface Records{
  $type: string;
  createdAt: string;
  langs?: string[];
  text: string;
}

interface Reply{
  parent: {
    $type: string;
    uri: string;
    cid: string;
    author: Author;
    record: Records;
    embed?: Embed;
  };
  root: {
    $type: string;
    uri: string;
    cid: string;
    author: Author;
    record: Records;
    embed?: Embed;
  }
}

export interface Post {
  uri: string;
  cid: string;
  author: Author;
  record: {
    $type: string;
    createdAt: string;
    langs?: string[];
    text: string;
    reply?: {
      parent: {
        uri: string;
        cid: string;
      };
      root: {
        uri: string;
        cid: string;
      }
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
  reply: Reply;
}

export interface TimelineResponse {
  feed: PostWrapper[];
  cursor: string | null;
}

export interface ScoreStats {
  average: number;
  count: number;
  total: number;
}