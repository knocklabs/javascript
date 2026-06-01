---
"@knocklabs/client": minor
---

Add server-to-client feed prefetching, modeled on TanStack Query's `prefetchQuery`/`initialData`/`hydrate`:

- `FeedClient.prefetch()` fetches a user's feed once on the server (no feed instance, socket, or store) and returns a `FeedResponse`. It sends the same request as `Feed.fetch`, so the prefetched data matches what the client would fetch on mount.
- New `initialData` feed option (and `Feed.hydrate`) seeds the feed store from a `FeedResponse` or a `Promise<FeedResponse>`. The promise form supports streaming/deferred data: a server loader can fire off `prefetch` without awaiting it and hand the pending promise to the client, which renders the feed on first paint instead of an empty/loading state.
