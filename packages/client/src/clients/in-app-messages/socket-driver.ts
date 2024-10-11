import { Store } from "@tanstack/store";
import { Channel, Socket } from "phoenix";

import { InAppMessagesClient } from "./message-client";
import { InAppMessage, InAppMessagesClientOptions } from "./types";

export enum SocketEventType {
  MessageCreated = "message.created",
}

const SOCKET_EVENT_TYPES = [SocketEventType.MessageCreated];

type ClientQueryParams = InAppMessagesClientOptions;

// e.g. in_app:<message-type>:<channel_id>:<user_id>
type ChannelTopic = string;

// Unique reference id of an in-app message client
type ClientReferenceId = string;

type MessageCreatedEventPayload = {
  event: SocketEventType.MessageCreated;
  topic: string;
  data: {
    in_app_message: InAppMessage;
  };
};

export type SocketEventPayload = MessageCreatedEventPayload;

// "attn" field contains a list of client reference ids that should be notified
// of a socket event.
type WithAttn<P> = P & { attn: Array<ClientReferenceId> };

type InAppMessageSocketInbox = Record<ClientReferenceId, SocketEventPayload>;

export class InAppMessageSocketDriver {
  // Mapping of live channels by topic. Note, there can be one or more in-app
  // message client(s) that can subscribe.
  private channels: Record<ChannelTopic, Channel>;

  // Mapping of query params for each in-app message client, partitioned by its
  // reference id, and grouped by channel topic. It's a double nested object
  // that looks like:
  //  {
  //    "in_app:card:...": {
  //      "ref-1": {
  //        "workflow_key": "foo",
  //      },
  //      "ref-2": {
  //        "workflow_key": "bar",
  //      },
  //    },
  //    "in_app:banner:...": {
  //      "ref-3": {
  //        "workflow_key": "baz",
  //      },
  //    }
  //  }
  //
  // Each time a new in-app message client joins a channel, we send all cumulated
  // params such that the socket API can apply filtering rules and figure out
  // which in-app message clients should be notified basd on reference ids in
  // "attn" field of the event payload when sending out an event.
  private params: Record<
    ChannelTopic,
    Record<ClientReferenceId, ClientQueryParams>
  >;

  // A reactive store that captures a new socket event, that notifies any in-app
  // message clients that have subscribed.
  private inbox: Store<
    InAppMessageSocketInbox,
    (cb: InAppMessageSocketInbox) => InAppMessageSocketInbox
  >;

  constructor(readonly socket: Socket) {
    this.channels = {};
    this.params = {};
    this.inbox = new Store<InAppMessageSocketInbox>({});
  }

  join(iamClient: InAppMessagesClient) {
    const topic = iamClient.socketChannelTopic();
    const referenceId = iamClient.referenceId;
    const params = iamClient.defaultOptions;

    if (!this.socket.isConnected()) {
      this.socket.connect();
    }

    if (!this.params[topic]) {
      this.params[topic] = {};
    }

    const maybeParams = this.params[topic][referenceId];
    const hasNewOrUpdatedParams =
      !maybeParams || JSON.stringify(maybeParams) !== JSON.stringify(params);

    if (hasNewOrUpdatedParams) {
      this.params[topic] = { ...this.params[topic], [referenceId]: params };
    }

    if (!this.channels[topic] || hasNewOrUpdatedParams) {
      const newChannel = this.socket.channel(topic, this.params[topic]);
      for (const eventType of SOCKET_EVENT_TYPES) {
        newChannel.on(eventType, (payload) => this.setInbox(payload));
      }
      this.channels[topic] = newChannel;
    }

    const channel = this.channels[topic];

    if (["closed", "errored"].includes(channel.state)) {
      channel.join();
    }

    const unsub = this.inbox.subscribe(() => {
      const payload = this.inbox.state[referenceId];
      if (!payload) return;

      iamClient.handleSocketEvent(payload);
    });

    return unsub;
  }

  leave(iamClient: InAppMessagesClient) {
    if (iamClient.unsub) {
      iamClient.unsub();
    }

    const topic = iamClient.socketChannelTopic();
    const referenceId = iamClient.referenceId;

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

    this.inbox.setState(() =>
      attn.reduce((acc, referenceId) => {
        return { ...acc, [referenceId]: rest };
      }, {}),
    );
  }
}
