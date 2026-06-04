import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AzureColors, AzureRadius, AzureShadow, Fonts } from '@/constants/theme';
import type {
  CinemaCardViewModel,
  DateFilterOption,
  FilterChipOption,
  ShowtimeButtonViewModel,
  TimeRangeKey,
} from '@/lib/booking-view-models';
import {
  formatAddress,
  formatRoomName,
  formatRoomType,
  formatShowtimeFormat,
} from '@/lib/user-display';

export function DateSelector({
  options,
  onSelectDate,
}: {
  options: DateFilterOption[];
  onSelectDate: (dateKey: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.dateRail}>
        {options.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected: option.active }}
            accessibilityLabel={`Chọn ngày ${option.weekdayText} ${option.dateText}`}
            onPress={() => onSelectDate(option.key)}
            style={({ pressed }) => [
              styles.dateCard,
              option.active ? styles.dateCardActive : null,
              pressed ? styles.pressed : null,
            ]}>
            <Text style={[styles.dateText, option.active ? styles.dateTextActive : null]}>
              {option.dateText}
            </Text>
            <Text style={[styles.weekdayText, option.active ? styles.weekdayTextActive : null]}>
              {option.weekdayText}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

export function TimeFilterChips({
  options,
  onSelectTimeRange,
}: {
  options: FilterChipOption<TimeRangeKey>[];
  onSelectTimeRange: (key: TimeRangeKey) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.chipRail}>
        {options.map((option) => (
          <FilterChip
            key={option.key}
            label={option.label}
            active={option.active}
            count={option.count}
            onPress={() => onSelectTimeRange(option.key)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export function CinemaBrandFilter({
  options,
  onSelectBrand,
}: {
  options: FilterChipOption[];
  onSelectBrand: (key: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.brandRail}>
        {options.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected: option.active }}
            accessibilityLabel={`Lọc theo ${option.label}`}
            onPress={() => onSelectBrand(option.key)}
            style={({ pressed }) => [
              styles.brandChip,
              option.active ? styles.brandChipActive : null,
              pressed ? styles.pressed : null,
            ]}>
            {option.logo ? (
              <Image source={{ uri: option.logo }} contentFit="contain" style={styles.brandLogo} />
            ) : (
              <View style={[styles.brandInitial, option.active ? styles.brandInitialActive : null]}>
                <Text style={[styles.brandInitialText, option.active ? styles.brandInitialTextActive : null]}>
                  {option.label.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
            <Text numberOfLines={1} style={[styles.brandText, option.active ? styles.brandTextActive : null]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function FilterChip({
  label,
  active,
  count,
  onPress,
}: {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Lọc suất chiếu ${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        active ? styles.filterChipActive : null,
        pressed ? styles.pressed : null,
      ]}>
      <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{label}</Text>
      {typeof count === 'number' ? (
        <Text style={[styles.filterCount, active ? styles.filterCountActive : null]}>
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function ShowtimeButton({
  showtime,
  onPressShowtime,
}: {
  showtime: ShowtimeButtonViewModel;
  onPressShowtime: (showtimeId: string) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chọn suất ${showtime.startLabel}, còn ${showtime.availableSeats} ghế`}
      onPress={() => onPressShowtime(showtime.id)}
      style={({ pressed }) => [styles.showtimeButton, pressed ? styles.pressed : null]}>
      <View style={styles.showtimeTop}>
        <Text style={styles.showtimeStart}>{showtime.startLabel}</Text>
        <Text style={styles.showtimeEnd}>~{showtime.endLabel}</Text>
      </View>
      <Text numberOfLines={1} style={styles.showtimeMeta}>
        {showtime.availableSeats}/{showtime.totalSeats} ghế
      </Text>
    </Pressable>
  );
}

export function CinemaCard({
  cinema,
  onToggle,
  onPressShowtime,
}: {
  cinema: CinemaCardViewModel;
  onToggle: (cinemaId: string) => void;
  onPressShowtime: (showtimeId: string) => void;
}) {
  return (
    <View style={styles.cinemaCard}>
      <View style={styles.cinemaHeader}>
        <View style={styles.logoBox}>
          {cinema.logo ? (
            <Image source={{ uri: cinema.logo }} contentFit="contain" style={styles.logoImage} />
          ) : (
            <Text style={styles.logoText}>{cinema.cinemaBrand.slice(0, 4).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.cinemaCopy}>
          <Text numberOfLines={1} style={styles.cinemaName}>
            {cinema.cinemaBrand} {cinema.cinemaName}
          </Text>
          <Text numberOfLines={2} style={styles.cinemaAddress}>
            {formatAddress(cinema.address)}
          </Text>
          <View style={styles.cinemaMetaRow}>
            {cinema.distanceLabel ? (
              <Text style={styles.cinemaMeta}>{cinema.distanceLabel}</Text>
            ) : null}
            <Text style={styles.cinemaMeta}>{cinema.showtimeCount} suất</Text>
          </View>
        </View>
        <View style={styles.cinemaActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Yêu thích ${cinema.cinemaName}`}
            hitSlop={8}
            style={({ pressed }) => [styles.smallAction, pressed ? styles.pressed : null]}>
            <MaterialCommunityIcons name="heart-outline" size={22} color={AzureColors.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: cinema.expanded }}
            accessibilityLabel={cinema.expanded ? 'Thu gọn suất chiếu' : 'Mở rộng suất chiếu'}
            onPress={() => onToggle(cinema.cinemaId)}
            hitSlop={8}
            style={({ pressed }) => [styles.smallAction, pressed ? styles.pressed : null]}>
            <MaterialCommunityIcons
              name={cinema.expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={AzureColors.primary}
            />
          </Pressable>
        </View>
      </View>

      {cinema.expanded ? (
        <View style={styles.showtimeGroups}>
          {cinema.showtimeGroups.map((group) => (
            <View key={group.key} style={styles.showtimeGroup}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>
                  {formatRoomName(group.roomName)} • {formatShowtimeFormat(group.format)}
                </Text>
                <Text style={styles.groupMeta}>{formatRoomType(group.roomType)}</Text>
              </View>
              <View style={styles.showtimeGrid}>
                {group.showtimes.map((showtime) => (
                  <ShowtimeButton
                    key={showtime.id}
                    showtime={showtime}
                    onPressShowtime={onPressShowtime}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dateRail: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  dateCard: {
    width: 96,
    minHeight: 78,
    borderRadius: AzureRadius.lg,
    borderWidth: 1,
    borderColor: AzureColors.border,
    backgroundColor: AzureColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  dateCardActive: {
    backgroundColor: AzureColors.primary,
    borderColor: AzureColors.primary,
  },
  dateText: {
    color: AzureColors.textPrimary,
    fontSize: 21,
    lineHeight: 27,
    fontFamily: Fonts.rounded,
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  weekdayText: {
    color: AzureColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sansBold,
  },
  weekdayTextActive: {
    color: '#EAF5FF',
  },
  chipRail: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    minHeight: 42,
    borderRadius: AzureRadius.round,
    borderWidth: 1,
    borderColor: AzureColors.border,
    backgroundColor: AzureColors.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: AzureColors.primary,
    borderColor: AzureColors.primary,
  },
  filterText: {
    color: AzureColors.textPrimary,
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterCount: {
    overflow: 'hidden',
    minWidth: 22,
    borderRadius: AzureRadius.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: AzureColors.secondary,
    backgroundColor: AzureColors.primaryLight,
    fontSize: 11,
    textAlign: 'center',
    fontFamily: Fonts.sansBold,
  },
  filterCountActive: {
    color: AzureColors.primary,
    backgroundColor: '#FFFFFF',
  },
  brandRail: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  brandChip: {
    width: 86,
    minHeight: 88,
    borderRadius: AzureRadius.lg,
    borderWidth: 1,
    borderColor: AzureColors.border,
    backgroundColor: AzureColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
  },
  brandChipActive: {
    borderColor: AzureColors.primary,
    backgroundColor: '#F8FCFF',
  },
  brandLogo: {
    width: 46,
    height: 36,
  },
  brandInitial: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AzureColors.primaryLight,
  },
  brandInitialActive: {
    backgroundColor: AzureColors.primary,
  },
  brandInitialText: {
    color: AzureColors.primary,
    fontSize: 18,
    fontFamily: Fonts.rounded,
  },
  brandInitialTextActive: {
    color: '#FFFFFF',
  },
  brandText: {
    maxWidth: 74,
    color: AzureColors.textSecondary,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    fontFamily: Fonts.sansBold,
  },
  brandTextActive: {
    color: AzureColors.primary,
  },
  cinemaCard: {
    borderWidth: 1,
    borderColor: AzureColors.border,
    borderRadius: AzureRadius.xl,
    backgroundColor: AzureColors.surface,
    padding: 16,
    gap: 16,
    ...AzureShadow.card,
  },
  cinemaHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AzureColors.primaryLight,
    overflow: 'hidden',
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  logoText: {
    color: AzureColors.primary,
    fontSize: 13,
    fontFamily: Fonts.rounded,
  },
  cinemaCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cinemaName: {
    color: AzureColors.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Fonts.sansBold,
  },
  cinemaAddress: {
    color: AzureColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Fonts.sansMedium,
  },
  cinemaMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cinemaMeta: {
    color: AzureColors.secondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sansBold,
  },
  cinemaActions: {
    alignItems: 'center',
    gap: 8,
  },
  smallAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: AzureColors.border,
    backgroundColor: '#F8FCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showtimeGroups: {
    gap: 16,
  },
  showtimeGroup: {
    borderTopWidth: 1,
    borderTopColor: AzureColors.border,
    paddingTop: 14,
    gap: 10,
  },
  groupHeader: {
    gap: 2,
  },
  groupTitle: {
    color: AzureColors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: Fonts.sansBold,
  },
  groupMeta: {
    color: AzureColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Fonts.sansMedium,
  },
  showtimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  showtimeButton: {
    minWidth: 106,
    minHeight: 74,
    borderRadius: AzureRadius.lg,
    borderWidth: 1,
    borderColor: AzureColors.border,
    backgroundColor: '#F8FCFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 4,
  },
  showtimeTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  showtimeStart: {
    color: AzureColors.primary,
    fontSize: 20,
    lineHeight: 25,
    fontFamily: Fonts.rounded,
  },
  showtimeEnd: {
    color: AzureColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: Fonts.sansBold,
  },
  showtimeMeta: {
    color: AzureColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sansMedium,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
