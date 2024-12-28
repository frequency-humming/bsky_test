/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import type { PostWrapper, Profile } from '../types/types';
import { fetchUserProfile } from '@/api';
import { useRouter } from 'next/router';
import ProfileCard from './../components/profileCard';
import ProfilePost from './../components/profilePosts';


const Home: NextPage = () => {
  const [profile, setProfile] = useState<Profile>();
  const [feed, setFeed] = useState<PostWrapper[]>([]);
  const [post, setPost] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const router = useRouter();
  const handle:string = "agent";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(post){
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const response = await fetchUserProfile(handle);
        const data = await response;
        if (data.error) {
          setError('Failed to fetch data');
        }
        if(data.url){
          router.push(data.url);
          return;
        }
        //setProfile(() => data.profile);
        if(data.profile && post){
          setProfile({ ...data.profile });
        }else if (data.profile){
          setProfile(data.profile);
        }     
        setFeed(data.feed);
      } catch (error) {
        setError('Error fetching data '+error);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      const data = await response.json();
      setPost(data.message);
      setInput('');
    } catch (error) {
      setError('Error: ' + error);
    }
  };

  return (
    <div className="p-12 font-mono">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (profile &&
        <ProfileCard profile={profile} />      
      )}
      {profile &&
      <div className="mt-8 mt-6 p-2 text-center">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1>Make a post</h1>
          <input
            type="text"
            placeholder="Create a post"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="px-4 py-2 w-72 text-lg border border-foreground rounded focus:outline-none focus:ring-2 focus:ring-foreground text-black"
          />
          <button
            type="submit"
            className="ml-4 px-6 py-2 text-lg bg-foreground text-background rounded hover:opacity-90"
          >
            Send
          </button>
        </form>
        {error && <p className="text-red-500">{error}</p>}
        {post && <p className="mt-6 p-2">Post created: {post}</p>}
      </div>}
      <br></br>
      {feed &&
        <ProfilePost posts={feed} />
      }
    </div>
  );
};

export default Home;