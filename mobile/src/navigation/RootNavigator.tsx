import React, { useEffect } from "react";
import { Alert, Platform, Text } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Iconify } from "react-native-iconify";

import { useTranslation } from "@/i18n";
import { setSessionReplacedHandler } from "@/api/client";
import { AboutScreen } from "@/screens/about/AboutScreen";
import { TeachersScreen } from "@/screens/about/TeachersScreen";
import { AssignmentDetailScreen } from "@/screens/assignments/AssignmentDetailScreen";
import { AssignmentsScreen } from "@/screens/assignments/AssignmentsScreen";
import { ForgotPasswordScreen } from "@/screens/auth/ForgotPasswordScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { ResetPasswordScreen } from "@/screens/auth/ResetPasswordScreen";
import { CertificateDetailScreen } from "@/screens/certificate/CertificateDetailScreen";
import { CertificatesScreen } from "@/screens/certificate/CertificatesScreen";
import { CheckoutScreen } from "@/screens/checkout/CheckoutScreen";
import { CourseDetailScreen } from "@/screens/courses/CourseDetailScreen";
import { CourseReviewScreen } from "@/screens/courses/CourseReviewScreen";
import { CoursesScreen } from "@/screens/courses/CoursesScreen";
import { SearchScreen } from "@/screens/courses/SearchScreen";
import { FreeLessonAddedScreen } from "@/screens/home/FreeLessonAddedScreen";
import { FreeLessonSelectScreen } from "@/screens/home/FreeLessonSelectScreen";
import { FreeLessonsScreen } from "@/screens/home/FreeLessonsScreen";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { NotificationsScreen } from "@/screens/home/NotificationsScreen";
import { OrdersScreen } from "@/screens/profile/OrdersScreen";
import { DownloadsScreen } from "@/screens/learn/DownloadsScreen";
import { LearningReportScreen } from "@/screens/learn/LearningReportScreen";
import { LessonPlayerScreen } from "@/screens/learn/LessonPlayerScreen";
import { MyLearningScreen } from "@/screens/learn/MyLearningScreen";
import { ChangePasswordScreen } from "@/screens/profile/ChangePasswordScreen";
import { DeviceManagerScreen } from "@/screens/profile/DeviceManagerScreen";
import { EditProfileScreen } from "@/screens/profile/EditProfileScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { QuizScreen } from "@/screens/quiz/QuizScreen";
import { QuizSubmissionScreen } from "@/screens/quiz/QuizSubmissionScreen";
import { QuizzesScreen } from "@/screens/quiz/QuizzesScreen";
import { NoteViewerScreen } from "@/screens/resource/NoteViewerScreen";
import { ResourceClassScreen } from "@/screens/resource/ResourceClassScreen";
import { ResourceNotesScreen } from "@/screens/resource/ResourceNotesScreen";
import { ResourcesScreen } from "@/screens/resource/ResourcesScreen";
import { SelectClassScreen } from "@/screens/onboarding/SelectClassScreen";
import { SelectDepartmentScreen } from "@/screens/onboarding/SelectDepartmentScreen";
import { SelectHscBatchScreen } from "@/screens/onboarding/SelectHscBatchScreen";
import { WelcomeScreen } from "@/screens/onboarding/WelcomeScreen";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors } from "@/theme";
import { AndroidExitGuard } from "@/navigation/AndroidExitGuard";
import { navigationRef } from "@/navigation/navigationRef";
import type {
  AppStackParamList,
  AuthStackParamList,
  MainTabParamList,
  OnboardingStackParamList,
} from "@/navigation/types";

const TAB_ICON_SIZE = 22;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<AppStackParamList>();
const CoursesStackNav = createNativeStackNavigator<AppStackParamList>();
const LearningStack = createNativeStackNavigator<AppStackParamList>();
const DownloadsStack = createNativeStackNavigator<AppStackParamList>();
const ProfileStack = createNativeStackNavigator<AppStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    primary: colors.primary,
    card: colors.surfaceElevated,
    text: colors.ink,
    border: colors.border,
  },
};

const stackScreenOptions = { headerShown: false } as const;

type AppStack = ReturnType<typeof createNativeStackNavigator<AppStackParamList>>;

function sharedAppScreens(Stack: AppStack) {
  return (
    <>
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="CourseReview" component={CourseReviewScreen} />
      <Stack.Screen name="LessonPlayer" component={LessonPlayerScreen} />
      <Stack.Screen name="LearningReport" component={LearningReportScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Quizzes" component={QuizzesScreen} />
      <Stack.Screen name="QuizSubmission" component={QuizSubmissionScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Certificates" component={CertificatesScreen} />
      <Stack.Screen name="CertificateDetail" component={CertificateDetailScreen} />
      <Stack.Screen name="Resources" component={ResourcesScreen} />
      <Stack.Screen name="ResourceClass" component={ResourceClassScreen} />
      <Stack.Screen name="ResourceNotes" component={ResourceNotesScreen} />
      <Stack.Screen name="NoteViewer" component={NoteViewerScreen} />
      <Stack.Screen name="Assignments" component={AssignmentsScreen} />
      <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
      <Stack.Screen name="Teachers" component={TeachersScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DeviceManager" component={DeviceManagerScreen} />
      <Stack.Screen name="MyLearning" component={MyLearningScreen} />
      <Stack.Screen name="FreeLessons" component={FreeLessonsScreen} />
      <Stack.Screen name="FreeLessonSelect" component={FreeLessonSelectScreen} />
      <Stack.Screen name="FreeLessonAdded" component={FreeLessonAddedScreen} />
    </>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      {sharedAppScreens(HomeStack)}
    </HomeStack.Navigator>
  );
}

function CoursesStackNavigator() {
  return (
    <CoursesStackNav.Navigator screenOptions={stackScreenOptions}>
      <CoursesStackNav.Screen name="CoursesMain" component={CoursesScreen} />
      {sharedAppScreens(CoursesStackNav)}
    </CoursesStackNav.Navigator>
  );
}

function LearningStackNavigator() {
  return (
    <LearningStack.Navigator screenOptions={stackScreenOptions}>
      <LearningStack.Screen name="LearningMain" component={MyLearningScreen} />
      {sharedAppScreens(LearningStack)}
    </LearningStack.Navigator>
  );
}

function DownloadsStackNavigator() {
  return (
    <DownloadsStack.Navigator screenOptions={stackScreenOptions}>
      <DownloadsStack.Screen name="DownloadsMain" component={DownloadsScreen} />
      {sharedAppScreens(DownloadsStack)}
    </DownloadsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      {sharedAppScreens(ProfileStack)}
    </ProfileStack.Navigator>
  );
}

function TabLabel({
  label,
  focused,
}: {
  label: string;
  focused: boolean;
}) {
  return (
    <Text
      style={{
        fontFamily: focused ? "Outfit_600SemiBold" : "DMSans_400Regular",
        fontSize: 11,
        color: focused ? colors.primary : colors.inkFaint,
        marginBottom: 2,
      }}
    >
      {label}
    </Text>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === "android" ? 10 : 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 56 + bottom,
          paddingTop: 6,
          paddingBottom: bottom,
          borderTopColor: colors.border,
          backgroundColor: colors.surfaceElevated,
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t("nav.tab.home")} focused={focused} />
          ),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Iconify
                icon="solar:home-2-bold"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ) : (
              <Iconify
                icon="solar:home-2-outline"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t("nav.tab.courses")} focused={focused} />
          ),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Iconify
                icon="solar:book-2-bold"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ) : (
              <Iconify
                icon="solar:book-2-outline"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
        }}
      />
      <Tab.Screen
        name="Learning"
        component={LearningStackNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t("nav.tab.learning")} focused={focused} />
          ),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Iconify
                icon="solar:play-circle-bold"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ) : (
              <Iconify
                icon="solar:play-circle-outline"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
        }}
      />
      <Tab.Screen
        name="Downloads"
        component={DownloadsStackNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t("nav.tab.downloads")} focused={focused} />
          ),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Iconify
                icon="solar:download-minimalistic-bold"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ) : (
              <Iconify
                icon="solar:download-minimalistic-outline"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label={t("nav.tab.profile")} focused={focused} />
          ),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Iconify
                icon="solar:user-circle-bold"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ) : (
              <Iconify
                icon="solar:user-circle-outline"
                size={TAB_ICON_SIZE}
                color={color}
              />
            ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="SelectClass" component={SelectClassScreen} />
      <OnboardingStack.Screen
        name="SelectHscBatch"
        component={SelectHscBatchScreen}
      />
      <OnboardingStack.Screen
        name="SelectDepartment"
        component={SelectDepartmentScreen}
      />
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
    </OnboardingStack.Navigator>
  );
}

export function RootNavigator() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const onboardingPending = useOnboardingStore((s) => s.pending);
  const forceSignOut = useAuthStore((s) => s.forceSignOut);

  useEffect(() => {
    setSessionReplacedHandler((message) => {
      void forceSignOut();
      Alert.alert(
        t("nav.sessionExpired.title"),
        message || t("nav.sessionExpired.message")
      );
    });
  }, [forceSignOut, t]);

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      {!token ? (
        <AndroidExitGuard>
          <AuthNavigator />
        </AndroidExitGuard>
      ) : onboardingPending ? (
        <AndroidExitGuard>
          <OnboardingNavigator />
        </AndroidExitGuard>
      ) : (
        <AndroidExitGuard>
          <MainTabs />
        </AndroidExitGuard>
      )}
    </NavigationContainer>
  );
}
