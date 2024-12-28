/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { PostWrapper,Profile } from '../../types/types';
import { fetchUserProfile } from '@/api';
import ProfileCard from './../../components/profileCard';
import ProfilePost from './../../components/profilePosts';

export default function Profile() {
  const router = useRouter();
  const { handle } = router.query;
  const [profile, setProfile] = useState<Profile>();
  const [posts, setPosts] = useState<PostWrapper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [did, setDid] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!handle) return; // Don't fetch if handle isn't available yet
        
        const response = await fetchUserProfile(handle as string);
        const data = await response;
        
        if (data.error) {
          setError('Failed to fetch profile data');
          return;
        }
        if(data.url){
            router.push(data.url);
        }
        setProfile(data.profile);
        setPosts(data.feed);
        setDid(data.did);
      } catch (error) {
        setError('Error fetching profile data: ' + error);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  if (error) {
    return <div className="p-12 font-mono text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="p-12 font-mono">Loading...</div>;
  }

  return (
    
    <div className="p-12 font-mono">
      <ProfileCard profile={profile} />   
      <br></br>
      {posts && did &&
        <ProfilePost posts={posts} did={did}/>
      }
    </div>
  );
}