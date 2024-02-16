import { Knock } from "@knocklabs/node";

import { getAppDetails } from "./app-details";

const knockClient = new Knock(
  process.env.KNOCK_API_KEY || "sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU",
);

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
  const { workflowKey, collection, objectId, tenant } = await getAppDetails();
  const result = await knockClient.workflows.trigger(workflowKey, {
    recipients: [
      {
        collection: collection,
        id: objectId,
      },
    ],
    tenant: tenant,
    data: {
      message: formData.get("message"),
    },
  });

  return result;
}
