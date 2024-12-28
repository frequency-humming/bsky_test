/* eslint-disable @next/next/no-img-element */
import type { PostWrapper } from '../types/types';
import { useState } from 'react';
import { postLike } from '@/api';
import { RepostIcon, LikeIcon } from './icons';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import VideoPlayer from './videoPlayer';

const ProfilePost = ({ posts }: { posts: PostWrapper[] }) => {

    const [likedPosts, setLikedPosts] = useState<Map<string, boolean>>(new Map());
    const [likeCounts, setLikeCounts] = useState<Map<string, number>>(new Map());

    const handleLikeClick = async (params: { postUri: string; postCid: string , count:number}) => {
        const { postUri, postCid , count} = params;
        
        try {
          if(likedPosts.get(postUri)){
            console.log('Already liked');
            return;
          }
          const data = await postLike(postUri, postCid);
          console.log('Post liked:', data);
          // Toggle liked state for this specific post
          setLikedPosts(prev => {
            const newMap = new Map(prev);
            newMap.set(postUri, true);
            return newMap;
          });
          // Update like count for this specific post
          setLikeCounts(prev => {
            const newCounts = new Map(prev);
            const currentCount = prev.get(postUri) || count;
            newCounts.set(postUri, currentCount + (likedPosts.get(postUri) ? 0 : 1));
            return newCounts;
          });
        } catch (error) {
          console.error('Like error:', error);
        }
      };
    
      const sanitizeUrl = (url: string) => {
        if ( !url || !url.startsWith('https://')) {
          return '';
        }
        return DOMPurify.sanitize(url);
      };

return (
    <div>
    {posts.map((postWrapper, index) => {
        const data = postWrapper.post;
        const isLiked = likedPosts.get(data.uri);
        const currentLikeCount = likeCounts.get(data.uri) || data.likeCount;
        const avatarUrl = sanitizeUrl(data.author.avatar);
        return (
            <div key={index} className="mb-5 border border-gray-300 p-4 flex flex-col items-center text-center">
                <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full" width={150} height={150}/>
                <br></br>
                <p>{data.author.viewer?.following ? "Following":"Not Following"}</p>
                <h3 className="mt-2 text-gray-500 font-bold">
                  <Link href={`/profile/${data.author.handle}`}>
                    {data.author.displayName} - {data.author.handle}
                  </Link>
                </h3>
                <p className="mt-1 text-gray-100">{data.record.text}</p>
                <div>
                {data.embed?.images?.map((image, index) => (   
                    <div key={index} className="mt-4">
                        <img
                        src={sanitizeUrl(image.fullsize)}
                        alt={image.alt || "Embedded image"}
                        width={400} 
                        height={0} // Height will be determined by `aspect-[ratio]`
                        className="rounded-lg aspect-[4/3]"
                        />
                    </div>
                    ))}
                </div>
                <div>
                    {data.embed?.external && 
                        <div>
                            <a
                                href={sanitizeUrl(data.embed.external.uri)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                                >
                                {data.embed.external.uri}
                            </a>
                            <p>{data.embed.external.title}</p>
                            <p>{data.embed.external.description}</p>  
                            {data.embed.external.thumb &&
                            <div className="flex justify-center items-center">
                                <img
                                src={sanitizeUrl(data.embed.external.thumb)} 
                                alt={"External image content"}
                                width={400} 
                                height={0} // Height will be determined by `aspect-[ratio]`
                                className="rounded-lg aspect-[4/3]"
                                />  
                            </div>}
                        </div>
                    }
                    {data.embed?.$type && data.embed.$type === 'app.bsky.embed.video#view' &&
                      <VideoPlayer playlist={data.embed.playlist} aspectRatio={data.embed.aspectRatio}
                      thumbnail={data.embed.thumbnail} />
                    }
                </div>
                <div className="flex items-center justify-center">
                  <RepostIcon/>
                  <p className="p-2">{data.repostCount}</p> 
                  <LikeIcon className={isLiked ? 'text-red-500' : ''} onClick={() => handleLikeClick({
                    postUri: data.uri,
                    postCid: data.cid,
                    count:data.likeCount
                  })}/>
                  <p className={`p-2 ${isLiked ? 'text-red-500' : ''}`}>
                    {currentLikeCount}
                  </p> 
                </div>
                <p className="mt-1 text-gray-100">{data.record.createdAt}</p>
            </div>                   
        );
    })}
    </div>
  );
};

export default ProfilePost;