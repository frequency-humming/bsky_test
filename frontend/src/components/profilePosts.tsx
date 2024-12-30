/* eslint-disable @next/next/no-img-element */
import type { PostWrapper } from '../types/types';
import { useState } from 'react';
import { postLike, postFollow } from './../api';
import { RepostIcon, LikeIcon } from './icons';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import VideoPlayer from './videoPlayer';
import ReplyCard from './replyCard';

const ProfilePost = ({ posts, did }: { posts: PostWrapper[], did:string }) => {

    const [likedPosts, setLikedPosts] = useState<Map<string, boolean>>(new Map());
    const [likeCounts, setLikeCounts] = useState<Map<string, number>>(new Map());
    const [followingStatus, setFollowingStatus] = useState<Map<string, boolean>>(new Map());
    const userDid = did;

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
      const handleFollow = async (follow:string, val:string|undefined) => {
        if(val){
          console.log('Already following');
          return;
        }
        try {
          const data = await postFollow(follow);
          console.log('Follow data:', data);
          setFollowingStatus(prev => {
            const newMap = new Map(prev);
            newMap.set(follow, true);
            return newMap;
          });
        }catch (error) {
          console.error('Follow error:', error);
        }
      };
      const getScoreGrade = (score: number): { grade: string; color: string } => {
        if (score >= 0.6) return { grade: 'A+', color: 'text-green-500' };
        if (score >= 0.3) return { grade: 'A', color: 'text-green-400' };
        if (score >= 0.1) return { grade: 'B+', color: 'text-blue-500' };
        if (score >= 0) return { grade: 'B', color: 'text-blue-400' };
        if (score >= -0.2) return { grade: 'C', color: 'text-yellow-500' };
        if (score >= -0.4) return { grade: 'D', color: 'text-orange-500' };
        return { grade: 'F', color: 'text-red-500' };
    };

return (
    <div>
    {posts.map((postWrapper, index) => {
        const data = postWrapper.post;
        const reply = postWrapper.reply;
        const isLiked = likedPosts.get(data.uri);
        const currentLikeCount = likeCounts.get(data.uri) || data.likeCount;
        const avatarUrl = sanitizeUrl(data.author.avatar);
        const follow = data.author.did.split('/app.bsky.feed.post/')[0];
        const isFollowing = followingStatus.get(follow) || data.author.viewer?.following;
        return (
            <div key={index} className="mb-5 border border-gray-300 p-4 flex flex-col items-center text-center">
                <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full" width={150} height={150}/>
                <br></br>
                {follow != userDid && 
                  <p onClick={() => handleFollow(follow, data.author.viewer?.following)}
                    className="cursor-pointer hover:text-blue-500">{isFollowing ? "Following" : "Not Following"}</p>
                }
                <h3 className="mt-2 text-gray-500 font-bold">
                  <Link href={`/profile/${data.author.handle}`}>
                    {data.author.displayName} - {data.author.handle}
                  </Link>
                </h3>
                <p className="mt-1 text-gray-100">{data.record.text}</p>
                <p className="mt-1 text-red-100">{data.score}</p>
                {typeof data.score === 'number' && (
                  <div className="mt-2 flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Sentiment Grade:</span>
                      <span className={`font-bold text-lg ${getScoreGrade(data.score).color}`}>
                          {getScoreGrade(data.score).grade}
                      </span>
                  </div>
                )}
                <div>
                {data.embed?.images?.map((image, index) => (   
                  
                    <div key={index} className={`mt-4 w-full ${
                      (image.aspectRatio?.width ?? 800) > 1000 
                          ? 'max-w-4xl' 
                          : (image.aspectRatio?.width ?? 800) > 600 
                              ? 'max-w-2xl' 
                              : 'max-w-xl'
                    }`}>
                      <div className="relative w-full" 
                        style={{ aspectRatio: `${image.aspectRatio?.width ?? 4} / ${image.aspectRatio?.height ?? 3}`}}>
                        <img
                          src={sanitizeUrl(image.fullsize)}
                          alt={image.alt || "Embedded image"}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
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
                              <div className="max-w-xl w-full">
                                  <img
                                    src={sanitizeUrl(data.embed.external.thumb)} 
                                    alt="External image content"
                                    className="w-full max-h-[500px] object-contain rounded-lg"
                                  />
                              </div>
                            </div>}
                        </div>
                    }
                    {data.embed?.$type && data.embed.$type === 'app.bsky.embed.video#view' && data.embed.playlist &&(
                      <VideoPlayer playlist={data.embed.playlist} aspectRatio={data.embed.aspectRatio}
                      thumbnail={data.embed.thumbnail} />
                    )}
                </div>
                { data.record?.reply && <ReplyCard reply={reply} /> }
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