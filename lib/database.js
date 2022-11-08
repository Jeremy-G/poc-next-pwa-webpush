import loki from "lokijs";

var db = new loki('data.db');

var posts = db.addCollection("posts");

var subscriptions = db.addCollection("subscriptions");

/*posts.insert([
  { subscriber: null, content: "1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", likes: [] },
  { subscriber: null, content: "2 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", likes: [] },
  { subscriber: null, content: "3 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", likes: [] },
  { subscriber: null, content: "4 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", likes: [] },
]);*/

export default { db, posts, subscriptions };