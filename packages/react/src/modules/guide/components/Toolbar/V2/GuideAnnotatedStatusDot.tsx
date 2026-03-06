import { Stack } from "@telegraph/layout";
import { Tooltip } from "@telegraph/tooltip";

export type StatusColor = "blue" | "red" | "yellow" | "gray";

// Directly copied from the design prototype.
const STATUS_SHAPES: Record<StatusColor, React.ReactNode> = {
  blue: (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
      <circle cx="4" cy="4" r="4" fill="var(--tgph-blue-9)" />
    </svg>
  ),
  yellow: (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
      <polygon points="4,0.5 7.5,7.5 0.5,7.5" fill="var(--tgph-yellow-9)" />
    </svg>
  ),
  gray: (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
      <circle
        cx="4"
        cy="4"
        r="2.75"
        fill="none"
        stroke="var(--tgph-gray-9)"
        strokeWidth="2.5"
      />
    </svg>
  ),
  red: (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
      <line
        x1="1.5"
        y1="1.5"
        x2="6.5"
        y2="6.5"
        stroke="var(--tgph-red-9)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="6.5"
        y1="1.5"
        x2="1.5"
        y2="6.5"
        stroke="var(--tgph-red-9)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export const GuideAnnotatedStatusDot = ({
  color,
  tooltip,
}: {
  color: StatusColor;
  tooltip: string;
}) => {
  return (
    <Tooltip label={tooltip}>
      <Stack
        as="span"
        align="center"
        justify="center"
        display="inline-flex"
        p="0_5"
        style={{ flexShrink: 0 }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
          {STATUS_SHAPES[color]}
        </svg>
      </Stack>
    </Tooltip>
  );
};
