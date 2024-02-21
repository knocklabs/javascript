"use server";

import { triggerWorkflow as knockTriggerWorkflow } from "../knock";

export default async function triggerWorkflow(formData: FormData) {
  await knockTriggerWorkflow(formData);
}
