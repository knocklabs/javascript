import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Box, Stack } from "@telegraph/layout";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { DisplayOption } from "./helpers";
// import React from "react";

import { InspectionResultOk } from "./useInspectGuideClientStore";

// const findNextPrevKey = (
//   currKey: string,
//   guides: InspectionResultOk["guides"]
// ) => {
//   const selectableGuides = guides.filter(g => !!g.annotation.selectable);
//   const currIndex = selectableGuides.findIndex(g => g.key === currKey);
//
//   const prevGuide = currIndex === 0
//     ? undefined
//     : selectableGuides[currIndex - 1];
//
//   const nextGuide = currIndex + 1 > selectableGuides.length - 1
//     ? undefined
//     : selectableGuides[currIndex + 1];
//
//   return { prev: prevGuide, next: nextGuide };
// }
// const findNextGuideKey = (
//   currKey: string,
//   guides: InspectionResultOk["guides"]
// ) => {
//   const selectableGuides = guides.filter(g => !!g.annotation.selectable);
//   const currIndex = selectableGuides.findIndex(g => g.key === currKey);
//
//   const prevGuide = currIndex === 0
//     ? undefined
//     : selectableGuides[currIndex - 1];
//
//   const nextGuide = currIndex + 1 > selectableGuides.length - 1
//     ? undefined
//     : selectableGuides[currIndex + 1];
//
//   return { prev: prevGuide, next: nextGuide };
// }

type Props = {
  guides: InspectionResultOk["guides"];
  displayOption: DisplayOption;
};

export const FocusChin = ({ guides, displayOption }: Props) => {
  const { client } = useGuideContext();
  const { debugSettings } = useStore(client.store, (state) => ({
    debugSettings: state.debug || {},
  }));

  const focusedKeys = Object.keys(debugSettings.focusedGuideKeys || {});

  // const { prev, next } = React.useMemo(() => {
  //   if (focusedKeys.length === 0) {
  //     return {}
  //   }
  //   const currentKey = focusedKeys[0];
  //
  //   return findNextAndPrevGuideKey(currentKey, guides)
  // }, [displayOption, focusedKeys.length]);

  const isFocused = focusedKeys.length > 0;
  if (!isFocused) {
    return null;
  }

  const currentKey = focusedKeys[0];

  // const currentIndex = currentKey ? guideKeys.indexOf(currentKey) : -1;

  // const setFocus = (key: string) => {
  //   client.setDebug({
  //     ...debugSettings,
  //     focusedGuideKeys: { [key]: true },
  //   });
  // };
  //
  // const hasPrev = currentIndex > 0;
  // const hasNext = currentIndex >= 0 && currentIndex < guideKeys.length - 1;

  return (
    <Box
      borderTop="px"
      px="3"
      py="1"
      overflow="hidden"
      backgroundColor="blue-2"
    >
      <Stack align="center" justify="space-between">
        <Text as="span" size="1" weight="medium" color="blue">
          Focus lock: {currentKey}
        </Text>
        <Stack align="center" gap="1">
          <Tooltip label="Focus previous guide">
            <Button
              size="0"
              variant="ghost"
              color="blue"
              leadingIcon={{ icon: ChevronLeft, alt: "Previous guide" }}
              // disabled={!hasPrev}
              onClick={() => {
                const selectableGuides = guides.filter(
                  (g) => !!g.annotation.selectable.status,
                );
                const currIndex = selectableGuides.findIndex(
                  (g) => g.key === currentKey,
                );

                const prevGuide =
                  currIndex === 0 ? undefined : selectableGuides[currIndex - 1];

                if (!prevGuide) return;

                client.setDebug({
                  ...debugSettings,
                  focusedGuideKeys: { [prevGuide.key]: true },
                });
              }}
            />
          </Tooltip>
          <Tooltip label="Focus next guide">
            <Button
              size="0"
              variant="ghost"
              color="blue"
              leadingIcon={{ icon: ChevronRight, alt: "Next guide" }}
              // disabled={!hasNext}
              onClick={() => {
                const selectableGuides = guides.filter(
                  (g) => !!g.annotation.selectable.status,
                );
                console.log(1, selectableGuides);
                const currIndex = selectableGuides.findIndex(
                  (g) => g.key === currentKey,
                );

                const nextGuide =
                  currIndex + 1 > selectableGuides.length - 1
                    ? undefined
                    : selectableGuides[currIndex + 1];

                if (!nextGuide) return;

                client.setDebug({
                  ...debugSettings,
                  focusedGuideKeys: { [nextGuide.key]: true },
                });
              }}
            />
          </Tooltip>
          <Tooltip label="Exit focus lock">
            <Button
              size="0"
              variant="ghost"
              color="blue"
              leadingIcon={{ icon: X, alt: "Clear focus" }}
              onClick={() => {
                client.setDebug({ ...debugSettings, focusedGuideKeys: {} });
              }}
            />
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};
