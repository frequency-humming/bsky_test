/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Profile } from '../../../types';
import { fetchUserProfile } from '@/api';

export default function Profile() {
  const router = useRouter();
  const { handle } = router.query;
  const [profile, setProfile] = useState<Profile>();
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex flex-col items-center">
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
          <p>
            Followers - {profile?.followersCount || 0} &nbsp;
            Following - {profile?.followsCount || 0} &nbsp;
            Posts - {profile?.postsCount || 0}
          </p>
        </div>
      </div>
    </div>
  );
}