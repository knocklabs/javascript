import { Box, Flex, Icon, IconButton, Text } from "@chakra-ui/react";
import { IoAlert, IoCheckmark, IoClose, IoInformation } from "react-icons/io5";

const IconType = {
  info: IoInformation,
  warning: IoAlert,
  success: IoCheckmark,
  error: IoAlert,
};

const IconColors = {
  info: ["gray.100", "gray.900"],
  warning: ["yellow.100", "yellow.900"],
  success: ["green.100", "green.900"],
  error: ["red.100", "red.900"],
};

const Toast = ({ title, description, status = "success", onClose }) => {
  const [bgColor, fgColor] = IconColors[status];
  const alignment = description ? "top" : "center";

  return (
    <Flex
      bgColor="white"
      p={3}
      borderColor="gray.100"
      borderWidth={1}
      width="354px"
      borderRadius="md"
      alignItems={alignment === "top" ? "flex-start" : "center"}
      filter="drop-shadow(0px 2px 16px rgba(102, 102, 102, 0.08))"
    >
      <Icon
        as={IconType[status]}
        backgroundColor={bgColor}
        color={fgColor}
        borderRadius="full"
        p={1}
        boxSize="20px"
      />
      <Flex ml={3} flexDir="column" textAlign="left" mr={1}>
        <Text
          fontSize={14}
          mt={alignment === "top" ? -0.5 : 0}
          fontWeight="medium"
          color="gray.900"
        >
          {title}
        </Text>
        {description && (
          <Box
            display="block"
            fontSize={14}
            fontWeight="medium"
            color="gray.600"
            mt={1}
            dangerouslySetInnerHTML={{ __html: description }}
            __css={{
              blockquote: {
                borderLeftWidth: "3px",
                borderLeftColor: "gray.300",
                marginTop: 2,
                paddingLeft: 3,
              },
            }}
          />
        )}
      </Flex>
      <IconButton
        display="flex"
        icon={<Icon as={IoClose} boxSize="12px" />}
        color="gray.600"
        aria-label="Close button"
        variant="unstyled"
        ml="auto"
        size="xs"
        width="16px"
        minW="auto"
        height="16px"
        p={0}
        paddingInline={0}
        mt={alignment === "top" ? -0.5 : 0}
        onClick={onClose}
      />
    </Flex>
  );
};

export default Toast;
