import { PostWrapper , Profile } from './types/types';
let cursor:string | null = "";

const fetchTimeline = async () => {

  let posts:PostWrapper[] = [];
  let error;
  let redirect;
  let did;

      try {
        const response = await fetch('/api/timeline?cursor='+cursor, {
          method: 'GET',
          credentials: 'include', // cookies
        });
        if (!response.ok) {
          throw new Error('Failed to fetch timeline');
        }
        const data = await response.json();
        if(data.redirect){
          redirect=data.redirect;
        }else{
          console.log(cursor);
          posts = data.feed;
          cursor = data.cursor;
          did = data.did;
          error = data.error;
        }     
      } catch (err) {
        error = 'An error occurred : '+ err;
      }
  return {posts,cursor,error,redirect,did};
}

const fetchUserProfile = async (handle:string) => {
  let profile:Profile | undefined;
  let feed:PostWrapper[] = [];
  let url:string = '';
  let error:string = '';
  let did;
  try {
    const response = await fetch('/api/profile/user?handle='+handle, {
      method: 'GET',
      credentials: 'include', // cookies
    });
    if (!response.ok) {
      throw new Error('Failed to fetch timeline client');
    }
    const data = await response.json();
    url = data.url;
    if(data.message){
      profile=data.message;
    }   
    feed=data.posts;
    did = data.did;
  } catch (err) {
    error = 'Error fetching data '+err;
  }
  return {profile, feed, error, url, did};
};

const postLike = async (postUri: string, postCid: string) => {
  try{
  const response = await fetch("/api/postlike", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      postUri,
      postCid
    })
  });
  if (!response.ok) {
    throw new Error('Failed to like post');
  }
  const data = await response.json();
  return data;
  }catch(err){
    console.log("error in like api "+err);
  }
};

const postFollow = async (follow: string) => {
  try{
  const response = await fetch("/api/follow", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      follow
    })
  });
  if (!response.ok) {
    throw new Error('Failed to like post');
  }
  const data = await response.json();
  return data;
  }catch(err){
    console.log("error in like api "+err);
  }
};

export {fetchUserProfile, fetchTimeline, postLike, postFollow};

