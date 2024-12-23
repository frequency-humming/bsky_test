/* eslint-disable @next/next/no-img-element */
import {fetchTimeline} from './api';
import { PostWrapper} from '../types';
import { useEffect, useState } from 'react';

export default function Feed() {
  const [error, setError] = useState<string>();
  const [posts, setPosts] = useState<PostWrapper[]>([]);
  const [page, setPage] = useState(1);
  const [showDiv, setDiv] = useState(false);

  useEffect(() => {
    const timeline = async () => {
    const data = await fetchTimeline();
    setPosts(data.posts);
    setError(data.error);
    
    }
    timeline();
  },[])

  const handleIntersect = (entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && showDiv) {
      setPage(page + 1);
      console.log('page '+page);
      fetchPosts();
    }
  }

  async function fetchPosts(){
    setDiv(false);
    try {
      const data = await fetchTimeline();
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      const timer = setTimeout(() => {
        console.log('in timer 2');
        setDiv(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    } catch (error) {
      setError('An error occurred : '+ error);
    }
  } 

  useEffect(() => {
    if(showDiv){
      const observer = new IntersectionObserver(handleIntersect);
      const target = document.getElementById('sentinel');
      if (target) observer.observe(target);
      console.log('in target '+target);
      return () => {
        if (target) observer.unobserve(target);
      };
    } 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('in timer');
      setDiv(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Timeline</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
            {posts.map((postWrapper, index) => {
                const data = postWrapper.post;
                return (
                    <div key={index} className="mb-5 border border-gray-300 p-4 flex flex-col items-center text-center">
                        <img src={data.author.avatar} alt="avatar" className="w-12 h-12 rounded-full" width={150} height={150}/>
                        <h3 className="mt-2 text-gray-500 font-bold">{data.author.displayName} - {data.author.handle}</h3>
                        <p className="mt-1 text-gray-100">{data.record.text}</p>
                        <div>
                        {data.embed?.images?.map((image, index) => (
                            <div key={index} className="mt-4">
                                <img
                                src={image.fullsize} 
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
                                        href={data.embed.external.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                        >
                                        {data.embed.external.uri}
                                    </a>
                                    <p>{data.embed.external.title}</p>
                                    <p>{data.embed.external.description}</p>  
                                    <div className="flex justify-center items-center">
                                        <img
                                        src={data.embed.external.thumb} 
                                        alt={"External image content"}
                                        width={400} 
                                        height={0} // Height will be determined by `aspect-[ratio]`
                                        className="rounded-lg aspect-[4/3]"
                                        />  
                                    </div>
                                </div>
                            }
                        </div>
                        <p className="mt-1 text-gray-100">{data.record.createdAt}</p>
                    </div>                   
                );
            })}
        </div>
      )}
      {showDiv && <div id="sentinel"></div> }
    </div>
  );
}