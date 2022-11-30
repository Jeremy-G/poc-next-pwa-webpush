import db from "lib/database";

export default function handler(req, res) {
  try {
    if (!req.body?.endpoint || !req.body?.keys?.auth || !req.body?.keys?.p256dh) {
      return (res.status(400).json({ error: "Bad Request" }));
    }

    const subscription = db.subscriptions.findOne({ "keys.auth": req.body.keys.auth });

    switch (req.method) {
      case ("POST"):
        if (!subscription) {
          const newSubscription = db.subscriptions.insert(req.body);

          return (res.status(200).json(newSubscription));
        }
        return (res.status(200).json(subscription));

      case ("DELETE"):
        if (!subscription) {
          return (res.status(404).json({ error: "Not found" }));
        }
        db.subscriptions.remove(subscription);

        return (res.status(200).json({ success: "true" }));

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
