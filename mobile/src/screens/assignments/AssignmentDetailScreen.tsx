import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";

import * as api from "@/api";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { StatusPill } from "@/components/StatusPill";
import { useTranslation } from "@/i18n";
import {
  assignmentResultLabel,
  formatAssignmentTimeLimit,
  formatDeadlineRemaining,
  formatMaxFileSize,
  getAssignmentDeadlineSeconds,
  isAssignmentResponseEmpty,
} from "@/lib/assignments";
import {
  formatDateTime,
  formatFileSize,
  getApiErrorMessage,
  stripHtml,
} from "@/lib/format";
import type { AppStackParamList } from "@/navigation/types";
import type { AssignmentUploadFile } from "@/api";
import { colors, radii, spacing } from "@/theme";

type Props = NativeStackScreenProps<AppStackParamList, "AssignmentDetail">;

export function AssignmentDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { courseSlug, assignmentId, assignmentTitle } = route.params;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [files, setFiles] = useState<AssignmentUploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["assignment", courseSlug, assignmentId],
    queryFn: () => api.fetchStudentAssignment(courseSlug, assignmentId),
  });

  const assignment = query.data;
  const submission = assignment?.submission ?? null;
  const maxFileSize = assignment?.max_file_size_bytes ?? 2 * 1024 * 1024;
  const maxLen = assignment?.max_response_text_length ?? 50000;
  const deadlineSeconds = assignment
    ? getAssignmentDeadlineSeconds(assignment)
    : null;
  const expired =
    deadlineSeconds !== null &&
    deadlineSeconds <= 0 &&
    (assignment?.time_limit ?? 0) > 0;

  const pickFiles = async () => {
    if (!assignment) return;
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const picked: AssignmentUploadFile[] = [];
    for (const asset of result.assets) {
      if (asset.size && asset.size > maxFileSize) {
        Alert.alert(
          t("assignments.detail.fileTooLargeTitle"),
          t("assignments.detail.fileTooLargeMessage", {
            name: asset.name,
            limit: formatMaxFileSize(maxFileSize),
          })
        );
        return;
      }
      picked.push({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
      });
    }
    if (picked.length > assignment.file_upload_limit) {
      Alert.alert(
        t("assignments.detail.limitExceededTitle"),
        t("assignments.detail.limitExceededMessage", {
          limit: assignment.file_upload_limit,
        })
      );
      return;
    }
    setFiles(picked);
  };

  const onSubmit = async () => {
    if (!assignment) return;
    const hasText = !isAssignmentResponseEmpty(responseText);
    const hasFiles = files.length > 0;
    const priorText =
      !!submission?.response_text &&
      !isAssignmentResponseEmpty(submission.response_text);
    const hadPrior =
      editing && (priorText || (submission?.files?.length ?? 0) > 0);

    if (!hasText && !hasFiles && !hadPrior) {
      setError(t("assignments.detail.answerRequired"));
      return;
    }
    if (responseText.length > maxLen) {
      setError(t("assignments.detail.answerTooLong", { max: maxLen }));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.submitAssignment(courseSlug, assignmentId, {
        responseText: hasText ? responseText : undefined,
        files,
      });
      setFiles([]);
      setEditing(false);
      await query.refetch();
      await queryClient.invalidateQueries({
        queryKey: ["assignment-submissions"],
      });
    } catch (err) {
      setError(getApiErrorMessage(err, t("assignments.detail.submitFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const showForm =
    !!assignment &&
    (assignment.can_submit || (editing && assignment.can_edit)) &&
    !expired;

  return (
    <Screen
      scroll
      loading={query.isLoading && !assignment}
      header={
        <AppHeader
          title={assignment?.title || assignmentTitle}
          onBack={() => navigation.goBack()}
        />
      }
      contentContainerStyle={styles.content}
    >
      {assignment ? (
        <>
          <Text style={styles.title}>{assignment.title}</Text>
          <Text style={styles.meta}>
            {formatAssignmentTimeLimit(
              assignment.time_limit,
              assignment.time_limit_option
            )}
            {" · "}
            {t("assignments.marks", {
              total: assignment.total_marks,
              pass: assignment.minimum_pass_marks,
            })}
          </Text>
          {deadlineSeconds != null ? (
            <Text style={styles.deadline}>
              {t("common.timeRemaining", {
                time: formatDeadlineRemaining(deadlineSeconds),
              })}
            </Text>
          ) : null}

          {assignment.instructions ? (
            <Text style={styles.body}>
              {stripHtml(assignment.instructions)}
            </Text>
          ) : null}

          {(assignment.attachments ?? []).map((file) => (
            <Pressable
              key={`${file.url}-${file.file_name}`}
              onPress={() => void Linking.openURL(file.url)}
              style={styles.attach}
            >
              <Text style={styles.attachName}>{file.file_name}</Text>
              <Text style={styles.attachSize}>{formatFileSize(file.size)}</Text>
            </Pressable>
          ))}

          {submission && !editing ? (
            <View style={styles.submitted}>
              <StatusPill
                label={assignmentResultLabel(submission)}
                tone={
                  submission.status === "pending_review"
                    ? "warning"
                    : submission.passed
                      ? "success"
                      : "danger"
                }
              />
              <Text style={styles.score}>
                {submission.score}/{submission.max_score} (
                {Math.round(submission.percentage)}%)
              </Text>
              <Text style={styles.date}>
                {t("assignments.detail.submittedAt", {
                  date: formatDateTime(submission.submitted_at),
                })}
              </Text>
              {submission.response_text ? (
                <Text style={styles.body}>
                  {stripHtml(submission.response_text)}
                </Text>
              ) : null}
              {(submission.files ?? []).map((file) => (
                <Pressable
                  key={`${file.url}-${file.file_name}`}
                  onPress={() => void Linking.openURL(file.url)}
                  style={styles.attach}
                >
                  <Text style={styles.attachName}>{file.file_name}</Text>
                </Pressable>
              ))}
              {assignment.can_edit ? (
                <Button
                  title={t("common.edit")}
                  variant="secondary"
                  onPress={() => {
                    setResponseText(submission.response_text ?? "");
                    setEditing(true);
                  }}
                />
              ) : null}
            </View>
          ) : null}

          {expired && !submission ? (
            <Text style={styles.error}>
              {t("assignments.detail.deadlineExpiredSubmit")}
            </Text>
          ) : null}

          {showForm ? (
            <View style={styles.form}>
              <Text style={styles.formLabel}>{t("common.yourAnswer")}</Text>
              <TextInput
                value={responseText}
                onChangeText={setResponseText}
                placeholder={t("assignments.detail.answerPlaceholder")}
                placeholderTextColor={colors.inkFaint}
                multiline
                textAlignVertical="top"
                style={styles.textarea}
              />
              <Button
                title={
                  files.length
                    ? t("assignments.detail.filesSelected", { count: files.length })
                    : t("assignments.detail.addFiles", {
                        limit: assignment.file_upload_limit,
                      })
                }
                variant="ghost"
                onPress={() => void pickFiles()}
              />
              {files.map((file) => (
                <Text key={file.uri} style={styles.fileName}>
                  {file.name}
                </Text>
              ))}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={editing ? t("common.update") : t("common.submit")}
                loading={submitting}
                onPress={() => void onSubmit()}
              />
              {editing ? (
                <Button
                  title={t("common.cancel")}
                  variant="ghost"
                  onPress={() => {
                    setEditing(false);
                    setFiles([]);
                    setError(null);
                  }}
                />
              ) : null}
            </View>
          ) : null}
        </>
      ) : (
        <Text style={styles.error}>{t("assignments.detail.notFound")}</Text>
      )}
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
    fontSize: 24,
    color: colors.ink,
  },
  meta: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.secondary,
  },
  deadline: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.inkMuted,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  attach: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 2,
  },
  attachName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.primaryDark,
  },
  attachSize: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkMuted,
  },
  submitted: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  score: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
  },
  date: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.inkFaint,
  },
  form: { gap: spacing.md },
  formLabel: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: colors.ink,
  },
  textarea: {
    minHeight: 140,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: colors.ink,
  },
  fileName: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.inkMuted,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.danger,
  },
});
