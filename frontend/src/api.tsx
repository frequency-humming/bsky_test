import { PostWrapper , Profile, TimelineResponse} from '../types';
let cursor:string | null = "";

const fetchTimeline = async () => {

  let posts:PostWrapper[] = [];
  let error;

      try {
        const response = await fetch('/api/timeline?cursor='+cursor, {
          method: 'GET',
          credentials: 'include', // cookies
        });
        if (!response.ok) {
          throw new Error('Failed to fetch timeline client');
        }
        const data: TimelineResponse = await response.json();
        console.log(cursor);
        posts = data.feed;
        cursor = data.cursor;
      } catch (err) {
        error = 'An error occurred : '+ err;
      }

  return {posts,cursor,error};
}

const fetchProfile = async () => {
  let profile:Profile | null = null;
  let feed:PostWrapper[] = [];
  let url:string = '';
  let error:string = '';
  try {
    const response = await fetch('/api/profile', {
      method: 'GET',
      credentials: 'include', // cookies
    });
    if (!response.ok) {
      throw new Error('Failed to fetch timeline client');
    }
    const data = await response.json();
    url = data.url;
    profile=data.message;
    feed=data.posts;
  } catch (err) {
    error = 'Error fetching data '+err;
  }
  return {profile, feed, error, url};
};

export {fetchProfile, fetchTimeline};

