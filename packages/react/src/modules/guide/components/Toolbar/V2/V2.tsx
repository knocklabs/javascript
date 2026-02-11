import { useGuideContext } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Box, Stack } from "@telegraph/layout";
import { Minimize2, Undo2 } from "lucide-react";
import React from "react";

import { KnockButton } from "../KnockButton";
import { TOOLBAR_Z_INDEX } from "../shared";
import "../styles.css";

import { GuideRow } from "./GuideRow";
import {
  DisplayOption,
  GuidesListDisplaySelect,
} from "./GuidesListDisplaySelect";
import { detectToolbarParam } from "./helpers";
import {
  InspectionResult,
  useInspectGuideClientStore,
} from "./useInspectGuideClientStore";

const GuidesList = ({
  guides,
  displayOption,
}: {
  guides: InspectionResult["guides"];
  displayOption: DisplayOption;
}) => {
  return guides.map((guide, idx) => {
    if (
      displayOption === "current-page" &&
      !guide.annotation.isEligible &&
      !guide.annotation.isQualified
    ) {
      return null;
    }
    if (displayOption === "all-eligible" && !guide.annotation.isEligible) {
      return null;
    }
    return <GuideRow key={guide.key} guide={guide} orderIndex={idx} />;
  });
};

export const V2 = () => {
  const { client } = useGuideContext();

  const [guidesListDisplayOption, setGuidesListDisplayOption] =
    React.useState<DisplayOption>("current-page");

  const [isVisible, setIsVisible] = React.useState(detectToolbarParam());
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  React.useEffect(() => {
    if (!isVisible) {
      return;
    }

    client.setDebug();

    return () => {
      client.unsetDebug();
    };
  }, [isVisible, client]);

  const result = useInspectGuideClientStore();
  if (!result) {
    return null;
  }

  return (
    <Box position="fixed" top="4" right="4" style={{ zIndex: TOOLBAR_Z_INDEX }}>
      {isCollapsed ? (
        <KnockButton onClick={() => setIsCollapsed(false)} />
      ) : (
        <Stack
          direction="column"
          backgroundColor="surface-2"
          shadow="2"
          rounded="3"
          border="px"
          overflow="hidden"
          style={{ width: "400px" }}
        >
          <Stack
            w="full"
            p="2"
            justify="space-between"
            direction="row"
            style={{ boxSizing: "border-box" }}
          >
            <Box style={{ width: "220px" }}>
              <GuidesListDisplaySelect
                value={guidesListDisplayOption}
                onChange={(opt) => setGuidesListDisplayOption(opt)}
              />
            </Box>

            <Stack gap="2">
              <Button
                onClick={() => setIsVisible(false)}
                size="1"
                variant="soft"
                trailingIcon={{ icon: Undo2, "aria-hidden": true }}
              >
                Exit
              </Button>
              <Button
                onClick={() => setIsCollapsed(true)}
                size="1"
                variant="soft"
                leadingIcon={{ icon: Minimize2, alt: "Collapse guide toolbar" }}
              />
            </Stack>
          </Stack>

          <Box w="full">
            {result.error && <Box>{result.error}</Box>}
            <GuidesList
              guides={result.guides}
              displayOption={guidesListDisplayOption}
            />
          </Box>
        </Stack>
      )}
    </Box>
  );
};
