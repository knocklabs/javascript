import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { FormEvent, useState } from "react";

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

    (e.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={onSubmit}>
      <FormControl mb={3}>
        <FormLabel htmlFor="message" fontSize={14}>
          Message
        </FormLabel>
        <Textarea
          id="message"
          name="message"
          placeholder="Message to be shown in the notification"
          size="sm"
          onChange={(e) => setMessage(e.target.value)}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel fontSize={14}>Template type</FormLabel>
        <Select
          mr={3}
          size="sm"
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value as TemplateType)}
        >
          <option value={TemplateType.Standard}>Standard</option>
          <option value={TemplateType.SingleAction}>Single-action</option>
          <option value={TemplateType.MultiAction}>Multi-action</option>
        </Select>
      </FormControl>
      <FormControl mb={4}>
        <FormLabel fontSize={14} display="flex" alignItems="center">
          <Checkbox
            name="showToast"
            size="sm"
            isChecked={showToast}
            onChange={(e) => setShowToast(e.target.checked)}
            mr={2}
          />{" "}
          Show a toast?{" "}
        </FormLabel>
      </FormControl>

      <Button
        type="submit"
        variant="solid"
        colorScheme="gray"
        size="sm"
        isDisabled={message === ""}
        isLoading={isLoading}
      >
        Send notification
      </Button>
    </form>
  );
};

export default SendNotificationForm;
