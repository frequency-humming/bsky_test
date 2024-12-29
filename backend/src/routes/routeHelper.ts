import { processEvent } from './../analyzer.js'; 

export const addScore = (posts: any) => {
    try {
        posts.forEach((postWrapper: any) => {
            if (postWrapper?.post?.record?.text) {
                const text = postWrapper.post.record.text;
                if (text.trim().length > 0) {
                    postWrapper.post.score = processEvent(text);
                } else {
                    postWrapper.post.score = 0;
                }
            } else {
                postWrapper.post.score = 0;
            }
        });
        return posts;
    } catch (err) {
        console.log("Error processing posts:", err);
        return posts;
    }
}