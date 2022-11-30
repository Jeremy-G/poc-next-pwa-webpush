import db from "lib/database";
import notify from "lib/notify";

export default function handler(req, res) {
  try {
    let { id } = req.query;
    if (!(id = parseInt(id)) || !req.body?.endpoint || !req.body?.keys?.auth || !req.body?.keys?.p256dh) {
      return (res.status(400).json({ error: "Bad Request" }));
    }

    const post = db.posts.get(id);
    if (!post) {
      return (res.status(404).json({ error: "Not found" }));
    }

    let subscription = db.subscriptions.findOne({ "keys.auth": req.body.keys.auth });

    if (!subscription) {
      subscription = db.subscriptions.insert(req.body);
    }

    switch (req.method) {
      
      case ("POST"):
        post.likes.push(subscription.keys.p256dh);
        db.posts.update(post);
        notify.notifyOne({ title: "New Like By #" + subscription?.keys?.p256dh?.slice(0, 8) + " !", message: post.content }, post.subscriber);

        return (res.status(201).json(post));

      case ("DELETE"):
        post.likes = post.likes.filter((like) => like != subscription.keys.p256dh);
        db.posts.update(post);

        return (res.status(200).json(post));
      
      default:
        return (res.status(405).json({ error: "Method Not Allowed" }));
    }
  } catch (err) {
    if ("statusCode" in err) {
      return (res.writeHead(err.statusCode, err.headers).json({ error: err.body }));
    } else {
      console.error(err);
      return (res.status(500).end());
    }
  }
};
