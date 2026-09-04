import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useFocusEffect } from "@react-navigation/native";

import { colors, radii, spacing } from "@/theme";
import type { Banner } from "@/types/api";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BANNER_SIDE = spacing.xl;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_SIDE * 2;
const BANNER_HEIGHT = 160;
const AUTO_PLAY_MS = 3000;
const SLIDE_ANIM_MS = 350;

type Props = {
  banners: Banner[];
};

export const HomeBannerSection = memo(function HomeBannerSection({
  banners,
}: Props) {
  const [bannerIndex, setBannerIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const bannerIndexRef = useRef(0);
  const isBannerFocused = useRef(true);
  const loopResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sliderData = useMemo(() => {
    if (banners.length > 1) return [...banners, banners[0]];
    return banners;
  }, [banners]);

  useFocusEffect(
    useCallback(() => {
      isBannerFocused.current = true;
      return () => {
        isBannerFocused.current = false;
      };
    }, [])
  );

  useEffect(() => {
    bannerIndexRef.current = 0;
    setBannerIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      if (!isBannerFocused.current) return;
      const next = bannerIndexRef.current + 1;
      scrollRef.current?.scrollTo({
        x: next * BANNER_WIDTH,
        animated: true,
      });

      if (next >= banners.length) {
        bannerIndexRef.current = 0;
        setBannerIndex(0);
        if (loopResetTimer.current) clearTimeout(loopResetTimer.current);
        loopResetTimer.current = setTimeout(() => {
          scrollRef.current?.scrollTo({ x: 0, animated: false });
        }, SLIDE_ANIM_MS);
      } else {
        bannerIndexRef.current = next;
        setBannerIndex(next);
      }
    }, AUTO_PLAY_MS);

    return () => {
      clearInterval(timer);
      if (loopResetTimer.current) clearTimeout(loopResetTimer.current);
    };
  }, [banners.length]);

  const onBannerScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / BANNER_WIDTH);
      if (index >= banners.length) {
        bannerIndexRef.current = 0;
        setBannerIndex(0);
        scrollRef.current?.scrollTo({ x: 0, animated: false });
        return;
      }
      if (index >= 0 && index < banners.length) {
        bannerIndexRef.current = index;
        setBannerIndex(index);
      }
    },
    [banners.length]
  );

  const openBanner = useCallback(async (banner: Banner) => {
    if (!banner.url) return;
    try {
      const canOpen = await Linking.canOpenURL(banner.url);
      if (canOpen) await Linking.openURL(banner.url);
    } catch {
      // ignore invalid banner links
    }
  }, []);

  if (banners.length === 0) return null;

  return (
    <View style={styles.bannerSection}>
      <View style={styles.bannerFrame}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          decelerationRate="fast"
          onMomentumScrollEnd={onBannerScrollEnd}
          scrollEventThrottle={16}
        >
          {sliderData.map((item, index) => (
            <Pressable
              key={`${item.id}-${index}`}
              style={styles.bannerSlide}
              onPress={() => void openBanner(item)}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.bannerImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={String(item.id)}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((banner, index) => (
            <View
              key={banner.id}
              style={[styles.dot, index === bannerIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  bannerSection: {
    paddingHorizontal: BANNER_SIDE,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  bannerFrame: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.primarySoft,
  },
  bannerSlide: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerImage: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
});
