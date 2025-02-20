import { Box, Stack } from "@telegraph/layout";
import { Icon, Lucide } from "@telegraph/icon";
import { Button } from "@telegraph/button";
import { Text } from "@telegraph/typography";

const IconType = {
  info: Lucide.Info,
  warning: Lucide.AlertTriangle,
  success: Lucide.Check,
  error: Lucide.X,
};

const IconColors = {
  info: ["gray-3", "gray"],
  warning: ["yellow-3", "yellow"],
  success: ["green-3", "green"],
  error: ["red-3", "red"],
} as const;

export interface ToastProps {
  title: string;
  description: string;
  status?: keyof typeof IconColors;
  onClose: () => void;
  useRenderedDescription?: boolean;
  actions?: React.ReactNode;
}

const Toast = ({ title, description, status = "success", onClose, useRenderedDescription = false, actions }: ToastProps) => {
  const [bgColor, fgColor] = IconColors[status];
  const alignment = description ? "top" : "center";

  return (
    <Stack
      alignItems={alignment === "top" ? "flex-start" : "center"}
      backgroundColor={bgColor}
      flexDirection="column"
      maxWidth="96"
      paddingBottom="4"
      paddingLeft="2"
      paddingTop="4"
      style={{
        boxShadow: "0px 2px 16px rgba(102, 102, 102, 0.08)",
      }}
      width="full"
    >
      <Stack marginLeft="3" flexDirection="row" marginRight="1" alignItems="flex-start">
        <Icon
          as={IconType[status]}
          icon={IconType[status]}
          color={fgColor}
          borderRadius="full"
          aria-hidden={true}
          width="6"
          height="6"
        />
        <Stack flexDirection="column" marginLeft="2" maxWidth="72">
          <Text
            as="span"
            fontSize="3"
            color={fgColor}
            style={{ lineHeight: "1.2" }}
          >
            {title}
          </Text>
          {description && useRenderedDescription ? (
          <Box
              marginTop="1"
              dangerouslySetInnerHTML={{ __html: description }}
          />
          ) : (
            <Text
              as="span"
              marginTop="2"
              color="gray"
              style={{ lineHeight: "1.1" }}
            >
              {description}
            </Text>
          )}
          {actions && actions}
        </Stack>
        {onClose && (
          <Button
            icon={{
              icon: Lucide.X,
              "aria-hidden": true,
            }}
            color="gray"
            aria-label="Close button"
            aria-hidden={true}
            variant="ghost"
            size="2"
            width="16px"
            marginLeft="4"
            minWidth="auto"
            height="16px"
            padding={0}
            onClick={onClose}
          />
        )}
      </Stack>
    </Stack>
  );
};

export { Toast };
