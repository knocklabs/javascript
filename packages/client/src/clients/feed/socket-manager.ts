import { Store } from "@tanstack/store";
import { Channel, Socket } from "phoenix";

import Feed from "./feed";
import type { FeedClientOptions, FeedMetadata } from "./interfaces";

export enum SocketEventType {
  NewMessage = "new-message",
}

const SOCKET_EVENT_TYPES = [SocketEventType.NewMessage];

type ClientQueryParams = FeedClientOptions;

// e.g. feed:<channel_id>:<user_id>
type ChannelTopic = string;

// Unique reference id of a feed client
type ClientReferenceId = string;

type NewMessageEventPayload = {
  event: SocketEventType.NewMessage;
  metadata: FeedMetadata;
};

export type SocketEventPayload = NewMessageEventPayload;

// "attn" field contains a list of client reference ids that should be notified
// of a socket event.
type WithAttn<P> = P & { attn: Array<ClientReferenceId> };

type FeedSocketInbox = Record<ClientReferenceId, SocketEventPayload>;

/*
 * Manages socket subscriptions for feeds, allowing multiple feed clients
 * to listen for real time updates from the socket API via a single socket
 * connection. It's expected to be instantiated once per feed channel.
 */
export class FeedSocketManager {
  // Mapping of live channels by topic. Note, there can be one or more feed
  // client(s) that can subscribe.
  private channels: Record<ChannelTopic, Channel>;

  // Mapping of query params for each in-app message client, partitioned by its
  // reference id, and grouped by channel topic. It's a double nested object
  // that looks like:
  //  {
  //    "feed:<channel_1>:<user_1>": {
  //      "ref-1": {
  //        "tenant": "foo",
  //      },
  //      "ref-2": {
  //        "tenant": "bar",
  //      },
  //    },
  //    "feed:<channel_2>:<user_1>": {
  //      "ref-3": {
  //        "tenant": "baz",
  //      },
  //    }
  //  }
  //
  // Each time a new feed client joins a channel, we send all cumulated
  // params such that the socket API can apply filtering rules and figure out
  // which feed clients should be notified basd on reference ids in
  // "attn" field of the event payload when sending out an event.
  private params: Record<
    ChannelTopic,
    Record<ClientReferenceId, ClientQueryParams>
  >;

  // A reactive store that captures a new socket event, that notifies any feed
  // clients that have subscribed.
  private inbox: Store<
    FeedSocketInbox,
    (cb: FeedSocketInbox) => FeedSocketInbox
  >;

  constructor(readonly socket: Socket) {
    this.channels = {};
    this.params = {};
    this.inbox = new Store<FeedSocketInbox>({});
  }

  join(feed: Feed) {
    // TODO Expose topic properly
    const topic = `feeds:${feed.userFeedId}`;
    const referenceId = feed.referenceId;
    const params = feed.defaultOptions;

    // Ensure a live socket connection if not yet connected.
    if (!this.socket.isConnected()) {
      this.socket.connect();
    }

    // If a new feed client joins, or has updated query params, then
    // track the updated params and (re)join with the latest query params.
    // Note, each time we send combined params of all feed clients that
    // have subscribed for a given feed channel and user, grouped by
    // client's reference id.
    if (!this.params[topic]) {
      this.params[topic] = {};
    }

    const maybeParams = this.params[topic][referenceId];
    const hasNewOrUpdatedParams =
      !maybeParams || JSON.stringify(maybeParams) !== JSON.stringify(params);

    if (hasNewOrUpdatedParams) {
      // Tracks all subscribed clients' params by reference id and by topic.
      this.params[topic] = { ...this.params[topic], [referenceId]: params };
    }

    if (!this.channels[topic] || hasNewOrUpdatedParams) {
      const newChannel = this.socket.channel(topic, this.params[topic]);
      for (const eventType of SOCKET_EVENT_TYPES) {
        newChannel.on(eventType, (payload) => this.setInbox(payload));
      }
      // Tracks live channels by channel topic.
      this.channels[topic] = newChannel;
    }

    const channel = this.channels[topic];

    // Join the channel if not already joined or joining or leaving.
    if (["closed", "errored"].includes(channel.state)) {
      channel.join();
    }

    // Let the feed client subscribe to the "inbox", so it can be notified
    // when there's a new socket event that is relevant to it
    const unsub = this.inbox.subscribe(() => {
      const payload = this.inbox.state[referenceId];
      if (!payload) return;

      feed.handleSocketEvent(payload);
    });

    return unsub;
  }

  leave(feed: Feed) {
    if (feed.unsub) {
      feed.unsub();
    }

    // TODO Expose topic properly
    const topic = `feeds:${feed.userFeedId}`;
    const referenceId = feed.referenceId;

    const partitionedParams = { ...this.params };
    const paramsForTopic = partitionedParams[topic] || {};
    const paramsForReferenceClient = paramsForTopic[referenceId];

    if (paramsForReferenceClient) {
      delete paramsForTopic[referenceId];
    }

    const channels = { ...this.channels };
    const channelForTopic = channels[topic];
    if (channelForTopic && Object.keys(paramsForTopic).length === 0) {
      for (const eventType of SOCKET_EVENT_TYPES) {
        channelForTopic.off(eventType);
      }
      channelForTopic.leave();
      delete channels[topic];
    }

    this.params = partitionedParams;
    this.channels = channels;
  }

  private setInbox(payload: WithAttn<SocketEventPayload>) {
    const { attn, ...rest } = payload;

    // Set the incoming socket event into the inbox, keyed by relevant client
    // reference ids provided by the server (via attn field), so we can notify
    // only the clients that need to be notified.
    this.inbox.setState(() =>
      attn.reduce((acc, referenceId) => {
        return { ...acc, [referenceId]: rest };
      }, {}),
    );
  }
}
