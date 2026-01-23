import { Select } from "@telegraph/select";

import { MAX_Z_INDEX } from "../shared";

export type DisplayOption = "current-page" | "all-eligible" | "all-guides";

type Props = {
  value: DisplayOption;
  onChange: (option: DisplayOption) => void;
};

export const GuidesListDisplaySelect = ({ value, onChange }: Props) => {
  return (
    <Select.Root
      size="1"
      value={value}
      onValueChange={(value) => {
        if (!value) return;
        onChange(value as DisplayOption);
      }}
      contentProps={{
        style: { zIndex: MAX_Z_INDEX },
      }}
    >
      {/*
        <Select.Option size="1" value="current-page">
          Present and activated on current page
        </Select.Option>
      */}
      <Select.Option size="1" value="all-eligible">
        All eligible guides for user
      </Select.Option>
      <Select.Option size="1" value="all-guides">
        All existing guides
      </Select.Option>
    </Select.Root>
  );
};
