/* eslint-disable @next/next/no-img-element */
import {fetchTimeline} from '../api';
import { PostWrapper} from '../types/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProfilePost from './profilePosts';

export default function Feed() {
  const [error, setError] = useState<string>();
  const [posts, setPosts] = useState<PostWrapper[]>([]);
  const [page, setPage] = useState(1);
  const [showDiv, setDiv] = useState(false);
  const [did, setDid] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const timeline = async () => {
    const data = await fetchTimeline();
    if(data.error){
      setError(data.error);
      return;
    }
    if(data.redirect){
      router.push(data.redirect);
    }
    setPosts(data.posts);
    setDid(data.did);
    }
    timeline();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

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
          {posts && did &&
            <ProfilePost posts={posts} did={did}/>
          }
        </div>
      )}
      {showDiv && <div id="sentinel"></div> }
    </div>
  );
}