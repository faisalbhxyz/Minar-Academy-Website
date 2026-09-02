import type { NavigatorScreenParams } from "@react-navigation/native";

import type { HscBatch } from "@/lib/onboarding";

export type OnboardingStackParamList = {
  SelectClass: undefined;
  SelectHscBatch: undefined;
  SelectDepartment: { batch: HscBatch };
  Welcome: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; token?: string } | undefined;
};

export type LessonPlayerParams = {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  lessonId: number;
  lessonTitle: string;
  lessonDescription?: string | null;
  lessonType?: string;
  sourceType: string;
  sourceData: string;
};

export type CheckoutParams = {
  courseId: number;
  courseTitle: string;
  pricingModel: "free" | "paid";
  priceLabel: string;
};

/** Shared stack inside every tab so the bottom bar stays visible. */
export type AppStackParamList = {
  HomeMain: undefined;
  CoursesMain:
    | {
        categorySlug?: string;
        categoryName?: string;
      }
    | undefined;
  LearningMain: undefined;
  LearningReportMain: undefined;
  MyLearning: undefined;
  DownloadsMain: undefined;
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  DeviceManager: undefined;
  Search: undefined;
  CourseDetail: { slug: string };
  CourseReview: { slug: string; courseTitle: string };
  LessonPlayer: LessonPlayerParams;
  Quiz: {
    courseSlug: string;
    quizId: number;
    quizTitle: string;
  };
  Quizzes: undefined;
  QuizSubmission: { submissionId: number; courseSlug?: string };
  Checkout: CheckoutParams;
  Certificates: undefined;
  CertificateDetail: { certificateId: number };
  Resources: undefined;
  ResourceClass: { classSlug: string; classTitle: string };
  ResourceNotes: {
    classSlug: string;
    subjectSlug: string;
    paperSlug: string;
    title: string;
  };
  NoteViewer: { title: string; pdfUrl: string; fileName?: string };
  Assignments: undefined;
  AssignmentDetail: {
    courseSlug: string;
    assignmentId: number;
    assignmentTitle: string;
  };
  Teachers: undefined;
  About: undefined;
  LearningReport: undefined;
  Notifications: undefined;
  Orders: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<AppStackParamList> | undefined;
  Courses: NavigatorScreenParams<AppStackParamList> | undefined;
  Learning: NavigatorScreenParams<AppStackParamList> | undefined;
  Downloads: NavigatorScreenParams<AppStackParamList> | undefined;
  Profile: NavigatorScreenParams<AppStackParamList> | undefined;
};
