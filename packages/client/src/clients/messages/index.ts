import { ApiResponse } from "../../api";
import Knock from "../../knock";
import { Status } from "../feed/feed";

class MessageClient {
  private knock: Knock;

  constructor(knock: Knock) {
    this.knock = knock;
  }

  async getMessage(messageId: string) {
    const result = await this.knock.client().makeRequest({
      method: "GET",
      url: `/v1/messages/${messageId}`,
    });

    return this.handleResponse(result);
  }

  async updateMessageStatus(messageId: string, status: Status) {
    const result = await this.knock.client().makeRequest({
      method: "PUT",
      url: `/v1/messages/${messageId}/${status}`,
    });

    return this.handleResponse(result);
  }

  async deleteMessageStatus(messageId: string, status: Status) {
    const result = await this.knock.client().makeRequest({
      method: "DELETE",
      url: `/v1/messages/${messageId}/${status}`,
    });

    return this.handleResponse(result);
  }

  async batchUpdateStatuses(messageIds: string[], status: Status) {
    const result = await this.knock.client().makeRequest({
      method: "POST",
      url: `/v1/messages/batch/${status}`,
      data: { message_ids: messageIds },
    });

    return this.handleResponse(result);
  }

  async batchUpdateAllStatusesInChannel(
    channelId: string,
    status: "seen" | "read" | "archive",
    options: any,
  ) {
    const result = await this.knock.client().makeRequest({
      method: "POST",
      url: `/v1/channels/${channelId}/messages/bulk/${status}`,
      data: options,
    });

    return this.handleResponse(result);
  }

  private handleResponse(response: ApiResponse) {
    if (response.statusCode === "error") {
      if (response.error?.response?.status < 500) {
        return response.error || response.body;
      }
      throw new Error(response.error || response.body);
    }

    return response.body;
  }
}

export default MessageClient;
