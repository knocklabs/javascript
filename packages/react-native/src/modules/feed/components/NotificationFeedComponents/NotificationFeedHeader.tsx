import {
  FilterStatus,
  Translations,
  useTranslations,
} from "@knocklabs/react-core";
import React, { SetStateAction } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "../../../../theme/useTheme";
import { ActionButton, ActionButtonType } from "../ActionButton";
import DividerView from "../Divider";

interface NotificationFeedHeaderProps {
  topHeaderActions?: TopHeaderAction[] | null;
  filters?: FilterStatus[];
  selectedFilter?: FilterStatus;
  setFilterStatus: React.Dispatch<SetStateAction<FilterStatus>>;
  styleOverride?: NotificationFeedHeaderTheme;
  onActionButtonTap: (action: TopHeaderAction) => void;
}

interface NotificationFeedHeaderTheme {
  textStyle: TextStyle;
  selectedColor: string;
  unselectedColor: string;
}

export enum TopHeaderAction {
  MARK_ALL_AS_READ = "markAllAsRead",
  ARCHIVE_READ = "archiveRead",
}

const NotificationFeedHeader: React.FC<NotificationFeedHeaderProps> = ({
  topHeaderActions = [
    TopHeaderAction.MARK_ALL_AS_READ,
    TopHeaderAction.ARCHIVE_READ,
  ],
  filters = [FilterStatus.All, FilterStatus.Unread, FilterStatus.Unseen],
  selectedFilter = FilterStatus.All,
  setFilterStatus,
  styleOverride,
  onActionButtonTap,
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const resolvedStyle = styleOverride || {
    textStyle: {
      fontFamily: theme.fontFamily.sanserif,
      fontSize: theme.fontSizes.knock2,
      fontWeight: theme.fontWeights.medium,
    },
    selectedColor: theme.colors.accent11,
    unselectedColor: theme.colors.gray11,
  };

  const renderTopActionButtons = ({
    actions,
  }: {
    actions: TopHeaderAction[];
  }) => {
    if (actions.length > 1) {
      return (
        <View style={styles.actionButtons}>
          {actions.map((action, index) => (
            <ActionButton
              key={index}
              title={t(action as keyof Translations) ?? ""}
              type={ActionButtonType.TERTIARY}
              action={() => onActionButtonTap(action)}
            />
          ))}
        </View>
      );
    }
    return null;
  };

  const renderFilter = ({ item }: { item: FilterStatus }) => (
    <TouchableOpacity
      onPress={() => setFilterStatus(item)}
      style={styles.filterButton}
    >
      <Text
        style={[
          styles.filterText,
          resolvedStyle.textStyle,
          {
            color:
              item === selectedFilter
                ? resolvedStyle.selectedColor
                : resolvedStyle.unselectedColor,
          },
        ]}
      >
        {t(item)}
      </Text>
      {item === selectedFilter && (
        <View
          style={[
            styles.selectedIndicator,
            { backgroundColor: resolvedStyle.selectedColor },
          ]}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      {filters.length > 1 && (
        <FlatList
          data={filters}
          renderItem={renderFilter}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterButtonRow}
        />
      )}
      {filters.length > 1 && <DividerView />}

      {renderTopActionButtons({ actions: topHeaderActions ?? [] })}
      <DividerView />
    </View>
  );
};

const styles = StyleSheet.create({
  filterButtonRow: {
    paddingHorizontal: 16,
  },
  filterButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  selectedIndicator: {
    height: 1,
    width: "100%",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    justifyContent: "space-around",
    alignContent: "center",
  },
});

export default NotificationFeedHeader;
