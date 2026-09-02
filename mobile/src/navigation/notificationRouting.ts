import { navigationRef } from "@/navigation/navigationRef";

type NotificationData = Record<string, string | undefined>;

function extractSlug(link: string): string | null {
  const match = link.match(/\/course\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function extractAssignmentId(link: string): number | null {
  const match = link.match(/\/assignments?\/(\d+)/i);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
}

export function navigateFromNotificationData(
  data: NotificationData | undefined
): void {
  if (!navigationRef.isReady()) return;

  const payload = data ?? {};
  const link = payload.link ?? payload.url;
  const screen = payload.screen?.toLowerCase();

  if (screen === "notifications" || link?.includes("/notifications")) {
    navigationRef.navigate("Home", { screen: "Notifications" });
    return;
  }

  if (screen === "assignments" || link?.includes("/assignment")) {
    const assignmentId =
      payload.assignment_id != null
        ? Number(payload.assignment_id)
        : link
          ? extractAssignmentId(link)
          : null;
    const courseSlug = payload.course_slug;

    if (assignmentId && courseSlug) {
      navigationRef.navigate("Home", {
        screen: "AssignmentDetail",
        params: {
          assignmentId,
          courseSlug,
          assignmentTitle: payload.assignment_title ?? "Assignment",
        },
      });
      return;
    }

    navigationRef.navigate("Home", { screen: "Assignments" });
    return;
  }

  if (screen === "orders" || link?.includes("/orders")) {
    navigationRef.navigate("Profile", { screen: "Orders" });
    return;
  }

  if (screen === "learning-report" || link?.includes("/learning-report")) {
    navigationRef.navigate("Home", { screen: "LearningReport" });
    return;
  }

  const slug =
    payload.course_slug ?? (link ? extractSlug(link) : null);
  if (screen === "course" || slug) {
    if (slug) {
      navigationRef.navigate("Home", {
        screen: "CourseDetail",
        params: { slug },
      });
      return;
    }
  }

  navigationRef.navigate("Home", { screen: "Notifications" });
}
