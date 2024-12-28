/* eslint-disable @next/next/no-img-element */
import type { Profile } from '../types/types';

const ProfileCard = ({ profile }: { profile: Profile }) => {


return (
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
  );
};

export default ProfileCard;