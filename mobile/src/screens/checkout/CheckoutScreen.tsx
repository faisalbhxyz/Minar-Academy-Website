import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/lib/format";
import { colors, radii, spacing } from "@/theme";
import type { AppStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "Checkout">;

export function CheckoutScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { courseId, courseTitle, pricingModel, priceLabel } = route.params;
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<string>("");
  const [txnId, setTxnId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const methodsQuery = useQuery({
    queryKey: ["payment-methods"],
    queryFn: api.fetchPaymentMethods,
    enabled: pricingModel === "paid",
  });

  const mutation = useMutation({
    mutationFn: api.createOrder,
    onSuccess: async (data: { message?: string }) => {
      setSuccess(data?.message || t("checkout.success.default"));
      await queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, t("checkout.error.orderFailed")));
    },
  });

  const onSubmit = () => {
    setError(null);
    setSuccess(null);

    if (pricingModel === "paid") {
      if (!method) {
        setError(t("checkout.error.selectMethod"));
        return;
      }
      if (!txnId.trim()) {
        setError(t("checkout.error.transactionRequired"));
        return;
      }
    }

    mutation.mutate({
      course_id: courseId,
      payment_method: pricingModel === "free" ? "free" : method,
      transaction_id: pricingModel === "free" ? null : txnId.trim(),
    });
  };

  return (
    <Screen
      scroll
      contentContainerStyle={styles.content}
      header={
        <AppHeader title={t("checkout.title")} onBack={() => navigation.goBack()} />
      }
    >
      <BrandLogo size="sm" />
      <Text style={styles.title}>{t("checkout.title")}</Text>
      <Text style={styles.course}>{courseTitle}</Text>
      <Text style={styles.price}>{priceLabel}</Text>

      {pricingModel === "paid" ? (
        <View style={styles.block}>
          <Text style={styles.label}>{t("checkout.paymentMethod")}</Text>
          {(methodsQuery.data ?? []).map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setMethod(m.title)}
              style={[
                styles.method,
                method === m.title ? styles.methodActive : null,
              ]}
            >
              <Text style={styles.methodTitle}>{m.title}</Text>
              {m.instruction ? (
                <Text style={styles.methodHint}>{m.instruction}</Text>
              ) : null}
            </Pressable>
          ))}
          <Input
            label={t("checkout.transactionId")}
            value={txnId}
            onChangeText={setTxnId}
            placeholder={t("checkout.transactionPlaceholder")}
            autoCapitalize="characters"
          />
        </View>
      ) : (
        <Text style={styles.freeNote}>{t("checkout.freeNote")}</Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Button
        title={
          pricingModel === "free"
            ? t("checkout.confirmFree")
            : t("checkout.submitOrder")
        }
        loading={mutation.isPending}
        onPress={onSubmit}
      />

      {success ? (
        <Button
          title={t("checkout.goToLearning")}
          variant="ghost"
          onPress={() => navigation.navigate("MyLearning")}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 28,
    color: colors.ink,
  },
  course: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: colors.ink,
  },
  price: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: colors.secondary,
  },
  block: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
  },
  method: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: 4,
  },
  methodActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  methodTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
  methodHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  freeNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    color: colors.danger,
  },
  success: {
    fontFamily: "DMSans_400Regular",
    color: colors.success,
    lineHeight: 20,
  },
});
