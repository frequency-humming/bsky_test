/* eslint-disable @next/next/no-img-element */
import DOMPurify from 'dompurify';
import type { PostWrapper } from '../types/types';
import Link from 'next/link';

const ReplyCard = ({ reply }: { reply: PostWrapper["reply"] }) => {
    const sanitizeUrl = (url: string) => {
        if (!url || !url.startsWith('https://')) {
            return '';
        }
        return DOMPurify.sanitize(url);
    };

    // Helper component for rendering a reply
    const RenderReply = ({ post, type }:{post:PostWrapper["reply"]["root"] | PostWrapper["reply"]["parent"], type:string}) => (
        <div className="mb-5 border border-gray-300 p-4 flex flex-col items-center text-center">

            <div className="flex flex-col items-center gap-2">
                {post.author?.avatar && (
                    <img 
                        src={sanitizeUrl(post.author.avatar)} 
                        alt="avatar" 
                        className="w-12 h-12 rounded-full"
                    />
                )}
                <div className="flex flex-col items-center">
                    <Link 
                        href={`/profile/${post.author?.handle}`}
                        className="font-bold text-gray-500 hover:text-gray-700"
                    >
                        {post.author?.handle}
                    </Link>
                </div>
            </div> 
    
            {post.record && (
                <div className="mt-4 w-full text-center">
                    <p className="text-gray-100">{post.record.text}</p>
                </div>
            )}
    
            {post.embed?.images && (
                <div className="w-full mt-4 flex flex-col items-center">
                    {post.embed.images.map((image, index) => (
                        <div key={index} className={`mt-4 w-full flex justify-center ${
                            (image.aspectRatio?.width ?? 800) > 1000 
                                ? 'max-w-4xl' 
                                : (image.aspectRatio?.width ?? 800) > 600 
                                    ? 'max-w-2xl' 
                                    : 'max-w-xl'
                        }`}>
                            <div className="relative w-full" 
                                style={{ 
                                    aspectRatio: `${image.aspectRatio?.width ?? 4} / ${image.aspectRatio?.height ?? 3}`
                                }}>
                                <img
                                    src={sanitizeUrl(image.fullsize)}
                                    alt={image.alt || "Embedded image"}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
    
            <div className="mt-2 text-sm text-gray-500">
                {type === 'root' ? 'Original Post' : 'Reply to'}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {reply?.root && (
                <RenderReply post={reply.root} type="root" />
            )}
            {reply?.parent && (
                <RenderReply post={reply.parent} type="parent" />
            )}
        </div>
    );
};

export default ReplyCard;