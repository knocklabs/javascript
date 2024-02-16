import { Knock } from "@knocklabs/node";

const knockClient = new Knock(process.env.KNOCK_API_KEY);

// TODO:Add your app details
// This function returns some values that would normally be determined
// by your application's business logic. We're hardcoding them for convenience
export function getAppDetails() {
  return {
    //TODO: Rename to tenant and collection to remain consistent with component params
    tenant: "knock-projects",
    collection: "repositories",
    objectId: "repo-2",
    userId: "123",
    workflowKey: "new-issue",
  };
}

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
  "use server";
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
