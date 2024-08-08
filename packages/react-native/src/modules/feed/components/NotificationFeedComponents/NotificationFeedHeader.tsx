import {
  FilterStatus,
  Translations,
  useTranslations,
} from "@knocklabs/react-core";
import React, { SetStateAction, useCallback, useMemo } from "react";
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

export interface NotificationFeedHeaderProps {
  selectedFilter?: FilterStatus;
  config?: NotificationFeedHeaderConfig;
  setFilterStatus: React.Dispatch<SetStateAction<FilterStatus>>;
  onTopActionButtonTap: (action: TopHeaderAction) => void;
}

export interface NotificationFeedHeaderConfig {
  filters?: FilterStatus[];
  topHeaderActions?: TopHeaderAction[];
  textStyle?: TextStyle;
  selectedColor?: string;
  unselectedColor?: string;
}

export enum TopHeaderAction {
  MARK_ALL_AS_READ = "markAllAsRead",
  ARCHIVE_READ = "archiveRead",
}

const NotificationFeedHeader: React.FC<NotificationFeedHeaderProps> = ({
  selectedFilter = FilterStatus.All,
  config = {
    filters: [FilterStatus.All, FilterStatus.Unread, FilterStatus.Unseen],
    topHeaderActions: [
      TopHeaderAction.MARK_ALL_AS_READ,
      TopHeaderAction.ARCHIVE_READ,
    ],
  },
  setFilterStatus,
  onTopActionButtonTap,
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const resolvedStyle = useMemo(
    () => ({
      textStyle: {
        fontFamily: config.textStyle?.fontFamily ?? theme.fontFamily.sanserif,
        fontSize: config.textStyle?.fontSize ?? theme.fontSizes.knock2,
        fontWeight: config.textStyle?.fontWeight ?? theme.fontWeights.medium,
      },
      selectedColor: config.selectedColor ?? theme.colors.accent11,
      unselectedColor: theme.colors.gray11,
    }),
    [config, theme],
  );

  const renderTopActionButtons = useCallback(() => {
    if (config.topHeaderActions) {
      return (
        <View style={styles.actionButtons}>
          {config.topHeaderActions.map((action, index) => (
            <ActionButton
              key={index}
              title={t(action as keyof Translations) ?? ""}
              type={ActionButtonType.TERTIARY}
              action={() => onTopActionButtonTap(action)}
            />
          ))}
        </View>
      );
    }
    return null;
  }, [t, onTopActionButtonTap, config.topHeaderActions]);

  const renderFilter = useCallback(
    ({ item }: { item: FilterStatus }) => (
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
    ),
    [resolvedStyle, selectedFilter, setFilterStatus, t],
  );

  return (
    <View>
      {config.filters && config.filters.length > 1 && (
        <FlatList
          data={config.filters}
          renderItem={renderFilter}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterButtonRow}
        />
      )}
      {config.filters && config.filters.length > 1 && <DividerView />}

      {renderTopActionButtons()}
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
