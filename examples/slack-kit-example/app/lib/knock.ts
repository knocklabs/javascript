import Knock from "@knocklabs/node";

import { getAppDetails } from "./app-details";

const knockClient = new Knock({
  apiKey: process.env.KNOCK_API_KEY,
});

export async function getTenant(tenant: string) {
  const response = await knockClient.tenants.get(tenant);
  return response;
}

export async function getChannelData(
  collection: string,
  objectId: string,
  channelId: string,
) {
  const response = await knockClient.objects.getChannelData(
    collection,
    objectId,
    channelId,
  );
  return response;
}

export async function getObject(collection: string, objectId: string) {
  const response = await knockClient.objects.get(collection, objectId);
  return response;
}

export async function triggerWorkflow(formData: FormData) {
  const { workflowKey, collection, objectId, tenant, userId } =
    await getAppDetails();
  let recipient: Knock.Recipients.RecipientRequest = { id: "123" };
  if (formData.get("recipient") === "user") {
    recipient = { id: userId };
  }
  if (formData.get("recipient") === "object") {
    recipient = {
      collection: collection,
      id: objectId,
    };
  }
  const result = await knockClient.workflows.trigger(workflowKey, {
    recipients: [recipient],
    tenant: tenant,
    data: {
      message: formData.get("message"),
    },
  });

  return result;
}
