import { ApiResponse } from "../../api";
import { BulkOperation } from "../../interfaces";
import Knock from "../../knock";

import {
  BulkUpdateMessagesInChannelProperties,
  Message,
  MessageEngagementStatus,
} from "./interfaces";

class MessageClient {
  private knock: Knock;

  constructor(knock: Knock) {
    this.knock = knock;
  }

  async get(messageId: string): Promise<Message> {
    const result = await this.knock.client().makeRequest({
      method: "GET",
      url: `/v1/messages/${messageId}`,
    });

    return this.handleResponse<Message>(result);
  }

  async updateStatus(
    messageId: string,
    status: MessageEngagementStatus,
  ): Promise<Message> {
    const result = await this.knock.client().makeRequest({
      method: "PUT",
      url: `/v1/messages/${messageId}/${status}`,
    });

    return this.handleResponse<Message>(result);
  }

  async removeStatus(
    messageId: string,
    status: Exclude<MessageEngagementStatus, "interacted">,
  ): Promise<Message> {
    const result = await this.knock.client().makeRequest({
      method: "DELETE",
      url: `/v1/messages/${messageId}/${status}`,
    });

    return this.handleResponse<Message>(result);
  }

  async batchUpdateStatuses(
    messageIds: string[],
    status: MessageEngagementStatus | "unseen" | "unread" | "unarchived",
  ): Promise<Message[]> {
    const result = await this.knock.client().makeRequest({
      method: "POST",
      url: `/v1/messages/batch/${status}`,
      data: { message_ids: messageIds },
    });

    return this.handleResponse<Message[]>(result);
  }

  async bulkUpdateAllStatusesInChannel({
    channelId,
    status,
    options,
  }: BulkUpdateMessagesInChannelProperties): Promise<BulkOperation> {
    const result = await this.knock.client().makeRequest({
      method: "POST",
      url: `/v1/channels/${channelId}/messages/bulk/${status}`,
      data: options,
    });

    return this.handleResponse<BulkOperation>(result);
  }

  private handleResponse<T = unknown>(response: ApiResponse) {
    if (response.statusCode === "error") {
      if (response.error?.response?.status < 500) {
        return response.error || response.body;
      }
      throw new Error(response.error || response.body);
    }

    return response.body as T;
  }
}

export default MessageClient;
