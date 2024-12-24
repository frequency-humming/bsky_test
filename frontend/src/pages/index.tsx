/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import type { PostWrapper, Profile } from '../../types';
import { fetchProfile } from '@/api';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const [profile, setProfile] = useState<Profile>();
  const [feed, setFeed] = useState<PostWrapper[]>([]);
  const [post, setPost] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(post){
          console.log('in timeout');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const response = await fetchProfile();
        const data = await response;
        if (data.error) {
          setError('Failed to fetch data');
        }
        if (data.redirect) {
          router.push(data.redirect);
          return;
        }
        //setProfile(() => data.profile);
        if(data.profile && post){
          console.log('1');
          setProfile({ ...data.profile });
        }else if (data.profile){
          console.log('2');
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
      ) : (
        <div className="flex flex-col items-center">
          {profile && (
            <>
              {profile.banner && (
                <div
                  className="w-full h-64 bg-cover bg-center mb-5"
                  style={{ backgroundImage: `url(${profile.banner})` }}
                ></div>
              )}
              <div className='flex flex-row items-center mt-6 p-5'>
                <div className='px-5'>
                  {profile.avatar && (
                    <img
                      src={profile.avatar}
                      alt="avatar"
                      className="rounded-full"
                      width={150}
                      height={150}
                    />
                  )}
                </div>
                <div>
                  <h1>Name - {profile?.displayName || 'No name available'}</h1>
                  <h3>Handle - {profile?.handle || 'No handle available'}</h3>
                  <h3>Description - {profile?.description || 'No description available'}</h3>
                  <h3>Created On - {profile?.createdAt || 'Unknown creation date'}</h3>
                </div>
              </div>  
              <div className="border border-gray-300 mt-6 p-2 text-center">
                <p>Followers - {profile?.followersCount || 0 } &nbsp;
                   Following - {profile?.followsCount || 0 } &nbsp;
                   Posts - {profile?.postsCount || 0}
                </p>
              </div>         
            </>
          )}
      </div>
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
      {feed && feed.map((posts,index) => {
        return (
          <div className="flex flex-col mt-6 p-2 items-center text-center" key={index}>
            <div className="p-4 border-4 border-gray-300">
              <p>{posts.post.record.text}</p>
              <br></br>
              <p>{posts.post.record.createdAt}</p>
            </div>  
          </div>
        )
      })}
    </div>
  );
};

export default Home;