import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";

import { useTranslation } from "@/i18n";
import type { DailyLearningTime, LearningTimeCategory } from "@/lib/learningReport";
import { colors, radii, spacing } from "@/theme";

const CHART_HEIGHT = 168;
const CHART_PADDING = { top: 8, right: 8, bottom: 4, left: 36 };

const CATEGORY_COLORS: Record<LearningTimeCategory, string> = {
  live_class: "#3b82f6",
  video: "#ef4444",
  quiz: "#f59e0b",
  exam: "#06b6d4",
  written_exam: "#22c55e",
};

const CATEGORY_ORDER: LearningTimeCategory[] = [
  "live_class",
  "video",
  "quiz",
  "exam",
  "written_exam",
];

type Props = {
  days: DailyLearningTime[];
  width: number;
};

function formatAxisSeconds(seconds: number): string {
  if (seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)}m`;
}

export function LearningTimeChart({ days, width }: Props) {
  const { t } = useTranslation();

  const chartWidth = Math.max(width - spacing.xl * 2, 280);
  const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const maxSeconds = useMemo(() => {
    const peak = Math.max(...days.map((day) => day.totalSeconds), 0);
    if (peak <= 0) return 60;
    const rounded = Math.ceil(peak / 60) * 60;
    return Math.max(rounded, 60);
  }, [days]);

  const yTicks = useMemo(() => {
    const step = maxSeconds / 4;
    return [0, step, step * 2, step * 3, maxSeconds];
  }, [maxSeconds]);

  const barGap = 10;
  const barWidth = Math.max(
    8,
    (innerWidth - barGap * (days.length - 1)) / Math.max(days.length, 1)
  );

  const hasData = days.some((day) => day.totalSeconds > 0);

  return (
    <View style={styles.wrap}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {yTicks.map((tick) => {
          const y =
            CHART_PADDING.top +
            innerHeight -
            (tick / maxSeconds) * innerHeight;
          return (
            <Line
              key={tick}
              x1={CHART_PADDING.left}
              x2={chartWidth - CHART_PADDING.right}
              y1={y}
              y2={y}
              stroke="#edf1f0"
              strokeWidth={1}
            />
          );
        })}

        {days.map((day, index) => {
          const x =
            CHART_PADDING.left + index * (barWidth + barGap);
          let stackedY =
            CHART_PADDING.top + innerHeight;

          return (
            <React.Fragment key={day.dateKey}>
              {CATEGORY_ORDER.map((category) => {
                const value = day.byCategory[category];
                if (value <= 0) return null;
                const height = (value / maxSeconds) * innerHeight;
                stackedY -= height;
                return (
                  <Rect
                    key={`${day.dateKey}-${category}`}
                    x={x}
                    y={stackedY}
                    width={barWidth}
                    height={height}
                    rx={4}
                    fill={CATEGORY_COLORS[category]}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </Svg>

      <View style={[styles.yAxis, { height: innerHeight, top: CHART_PADDING.top }]}>
        {[...yTicks].reverse().map((tick) => (
          <Text key={tick} style={styles.yLabel}>
            {formatAxisSeconds(Math.round(tick))}
          </Text>
        ))}
      </View>

      <View style={[styles.xAxis, { width: innerWidth, marginLeft: CHART_PADDING.left }]}>
        {days.map((day) => (
          <Text key={day.dateKey} style={styles.xLabel}>
            {day.label}
          </Text>
        ))}
      </View>

      {!hasData ? (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <View style={styles.emptyBadge}>
            <Text style={styles.emptyText}>{t("learning.report.chartEmpty")}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.legend}>
        {CATEGORY_ORDER.map((category) => (
          <View key={category} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: CATEGORY_COLORS[category] },
              ]}
            />
            <Text style={styles.legendLabel}>
              {t(`learning.report.categories.${category}`)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    marginTop: spacing.sm,
  },
  yAxis: {
    position: "absolute",
    left: 0,
    width: CHART_PADDING.left - 4,
    justifyContent: "space-between",
  },
  yLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: colors.inkFaint,
    textAlign: "right",
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  xLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.inkMuted,
    flex: 1,
    textAlign: "center",
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBadge: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.inkMuted,
  },
});
