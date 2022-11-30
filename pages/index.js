import { useEffect, useState } from "react";
import base64ToUint8Array from "lib/base64ToUint8Array";

import {
  useInput,
  Container,
  Card,
  Grid,
  Text,
  Button,
  Textarea,
  Spacer
} from "@nextui-org/react";
import { HeartIcon } from "components/Heart";

export default function Home() {
  const [ subscriptionData, setSubscriptionData ] = useState(null);
  const [ subscription, setSubscription ] = useState(null);
  const [ registration, setRegistration ] = useState(null);
  const [ posts, setPosts ] = useState([]);
  const [ channel, setChannel ] = useState(new BroadcastChannel("notifications"));

  /*
  **  POSTS
  */
  async function fetchPosts() {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function submitPost(e) {
    e.preventDefault();

    if (!subscription || !subscriptionData || !e.target.content.value) { return; }

    try {
      const data = {
        subscriber: subscriptionData,
        content: e.target.content.value
      };
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  }

  /*
  **  LIKES
  */

  async function like(id) {
    try {
      const data = {
        ...subscriptionData
      };
      const res = await fetch("/api/posts/" + id + "/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function unlike(id) {
    try {
      const data = {
        ...subscriptionData
      };
      const res = await fetch("/api/posts/" + id + "/like", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  }

  /*
  **  SUBSCRIPTIONS
  */
  async function subscribe() {
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY)
      });
      setSubscription(sub);
    } catch (err) {
      console.error(err);
    }
  }

  async function unsubscribe() {
    try {
      if (!subscription) { return; }

      const res = await fetch("/api/subscriptions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
      });
      await subscription.unsubscribe();
      setSubscription(null);
      if (res.ok) {
        setSubscriptionData(null);
      }
    } catch(err) {
      console.error(err);
    }
  }

  async function fetchSubscriptionData() {
    try {
      if (!subscription) { return; }

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
      });

      if (res.ok) {
        const data = await res.json();
        setSubscriptionData(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /*
  **  HOOKS
  */
  useEffect(() => {
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
          setSubscription(sub);
        }
      });
      setRegistration(reg);
    });
    fetchPosts();
    channel.addEventListener("message", event => {
      fetchPosts();
    });
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
  }, [ subscription ]);

  return (
    <Container css={{ marginTop: "40px" }}>
      <Text
        size={60}
        css={{
          textGradient: "45deg, $yellow600 -20%, $red600 100%",
          textAlign: "center"
        }}
        weight="bold"
      >
        PWA-POC
      </Text>
      <Grid.Container gap={2} css={{ marginTop: "40px" }}>
        <Grid xs={12} sm={4}>
          <Card>
            <Card.Header>
              <Text b>Notification</Text>
            </Card.Header>
            <Card.Divider />
            <Card.Body>
              { (subscription) ?
                <Text>You can unsubscribe if you want.</Text>
                :
                <Text>Subscribe to notifications to be able to add new posts and likes.</Text>
              }
            </Card.Body>
            <Card.Footer css={{ justifyContent: "flex-end" }}>
              { (subscription) ?
                <Button color="error" onPress={ unsubscribe }>Unsubscribe</Button>
                :
                <Button onPress={ subscribe }>Subscribe</Button>
              }
            </Card.Footer>
          </Card>
        </Grid>

        <Grid xs={12} sm={8}>
          <Card>
            <form onSubmit={ submitPost }>
              <Card.Header>
                <Text b>New post</Text>
              </Card.Header>
              <Card.Divider />
              <Card.Body>
                <Textarea
                  css={{ mt: "18px" }}
                  labelPlaceholder="Post content"
                  disabled={ !subscription || !subscriptionData }
                  required
                  name="content"
                ></Textarea>
              </Card.Body>
              <Card.Footer css={{ justifyContent: "flex-end" }}>
                <Button type="submit" disabled={ !subscription || !subscriptionData }>Submit</Button>
              </Card.Footer>
            </form>
          </Card>
        </Grid>
      </Grid.Container>
      <Spacer y={3} />
      <Text
        h2
        css={{
          textGradient: "45deg, $blue600 -20%, $pink600 50%",
        }}
      >
        Posts
      </Text>
      <Grid.Container gap={2} css={{ marginTop: "40px" }}>
        { posts.map((post) => (
          <Grid xs={12} sm={6} md={4} key={ post["$loki"] }>
            <Card>
              <Card.Body>
                { post.content }
              </Card.Body>
              <Card.Divider />
              <Card.Footer css={{ justifyContent: "space-between" }}>
                <Text>By { post.subscriber?.keys?.p256dh?.slice(0, 8) || "an unknown user" }.</Text>
                { (subscriptionData && post.likes.some((like) => (like == subscriptionData?.keys?.p256dh))) ?
                  <Button
                    auto
                    light
                    disabled={ !subscription || !subscriptionData }
                    animated={ false }
                    color="error"
                    css={{
                      paddingRight: "var(--nextui-space-7)"
                    }}
                    icon={<HeartIcon fill="currentColor" filled />}
                    onPress={ () => unlike(post["$loki"]) }
                  />
                  :
                  <Button
                    auto
                    light
                    disabled={ !subscription || !subscriptionData }
                    animated={ false }
                    color="error"
                    css={{
                      paddingRight: "var(--nextui-space-7)"
                    }}
                    icon={<HeartIcon fill="currentColor" />}
                    onPress={ () => like(post["$loki"]) }
                  />
                }
              </Card.Footer>
            </Card>
          </Grid>
        )) }
      </Grid.Container>
    </Container>
  );
}
