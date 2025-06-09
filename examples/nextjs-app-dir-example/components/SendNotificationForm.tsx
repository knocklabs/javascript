import { Button } from "@telegraph/button";
import { Box, Stack } from "@telegraph/layout";
import { Select } from "@telegraph/select";
import { TextArea } from "@telegraph/textarea";
import { Text } from "@telegraph/typography";
import { type FormEvent, useState } from "react";

import { notify } from "../lib/api";

interface Props {
  userId: string;
  tenant: string;
}

enum TemplateType {
  Standard = "standard",
  SingleAction = "single-action",
  MultiAction = "multi-action",
}

const SendNotificationForm = ({ userId, tenant }: Props) => {
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(true);
  const [templateType, setTemplateType] = useState(TemplateType.Standard);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    await notify({ message, showToast, userId, tenant, templateType });
    setIsLoading(false);
    setMessage("");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack direction="column" gap="4" marginTop="3">
        <Box>
          <Stack direction="column" gap="1">
            <Text as="label" htmlFor="message" size="2">
              Message
            </Text>
            <TextArea
              as="textarea"
              display="block"
              id="message"
              height="20"
              name="message"
              placeholder="Message to be shown in the notification"
              size="2"
              onChange={(e) => setMessage(e.target.value)}
            />
          </Stack>
        </Box>
        <Box marginBottom="3">
          <Stack direction="column" gap="1">
            <Text as="label" size="2">
              Template type
            </Text>
            <Box marginRight="2">
              <Select.Root
                size="2"
                value={templateType}
                onValueChange={(value) =>
                  setTemplateType(value as TemplateType)
                }
              >
                <Select.Option value={TemplateType.Standard}>
                  Standard
                </Select.Option>
                <Select.Option value={TemplateType.SingleAction}>
                  Single-action
                </Select.Option>
                <Select.Option value={TemplateType.MultiAction}>
                  Multi-action
                </Select.Option>
              </Select.Root>
            </Box>
          </Stack>
        </Box>
        <Box marginBottom="3">
          <Text as="label" size="2">
            <Stack direction="row" alignItems="center">
              <input
                type="checkbox"
                name="showToast"
                checked={showToast}
                onChange={(e) => setShowToast(e.target.checked)}
              />
              <Text as="span" size="2" marginLeft="1">
                Show a toast?
              </Text>
            </Stack>
          </Text>
        </Box>
        <Button
          type="submit"
          variant="solid"
          color="accent"
          size="2"
          disabled={message === ""}
          state={isLoading ? "loading" : undefined}
        >
          Send Notification
        </Button>
      </Stack>
    </form>
  );
};

export default SendNotificationForm;
