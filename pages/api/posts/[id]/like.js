import db from "lib/database";

export default function handler(req, res) {
  try {
    let { id } = req.query;
    if (!(id = parseInt(id))) {
      return (res.status(400).json({ error: "Bad Request" }));
    }

    const post = db.posts.get(id);
    if (!post) {
      return (res.status(404).json({ error: "Not found" }));
    }

    switch (req.method) {
      
      // TODO: METHODS PATCH AND DELETE
      
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
