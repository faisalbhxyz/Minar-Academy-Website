export type PricingModel = "free" | "paid";
export type LessonType = "video" | "live_session" | "audio" | "text";
export type LessonSourceType =
  | "youtube"
  | "vimeo"
  | "custom_code"
  | "upload"
  | "google_drive"
  | "sound_cloud"
  | "spotify";

export interface Banner {
  id: number;
  title: string;
  image: string;
  url: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  sub_categories?: Category[];
}

export interface StudentClassProfile {
  class_level: string;
  hsc_batch?: string | null;
  department?: string | null;
  preferred_class_slug?: string | null;
  onboarding_completed: boolean;
  updated_at: string;
}

export interface Student {
  id: number;
  user_id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email: string;
  profile_image?: string | null;
  status: string;
  enrollments?: { id: number; course_id: number; student_id: number }[];
  class_profile?: StudentClassProfile | null;
}

export interface LessonSource {
  data: string;
  is_file: boolean;
  playback_times?: string | null;
  /** Admin Drive link for offline — do not use for playback. */
  drive_url?: string | null;
  drive_file_id?: string | null;
}

export interface LessonResource {
  id: number;
  course_id?: number;
  lesson_id?: number;
  mime_type: string;
  title: string;
  file_path: string;
  url?: string;
  position?: number;
  file_size?: number;
}

export interface CourseLesson {
  id: number;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  source_type: LessonSourceType;
  source: { data: LessonSource };
  is_published: boolean;
  is_public: boolean;
  resources?: LessonResource[] | Record<string, string> | null;
  position: number;
  chapter_id: number;
  /** When true, enrolled students may save offline via the download API. */
  offline_downloadable?: boolean;
  /**
   * Drive share/preview link — do not fetch this for file save.
   * Use GET /course/{slug}/lessons/{id}/download?format=json instead.
   */
  download_url?: string | null;
}

export interface LessonOfflineDownloadData {
  download_url: string;
  file_name: string;
  content_type?: string;
  file_size?: number;
  expires_at?: string;
}

export type AssignmentTimeLimitOption =
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months";

export interface AssignmentAttachment {
  id?: number;
  url: string;
  file_name: string;
  mime_type: string;
  size: number;
}

export interface AssignmentSubmissionSummary {
  id: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  status: "pending_review" | "graded" | "submitted";
  submitted_at: string;
  response_text?: string;
  files?: AssignmentAttachment[];
}

export interface AssignmentSubmissionRecord {
  id: number;
  assignment_id: number;
  assignment_title: string;
  chapter_title: string;
  student_name: string;
  student_email: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  status: "pending_review" | "graded" | "submitted";
  submitted_at: string;
  file_count: number;
  response_text?: string;
  files?: AssignmentAttachment[];
}

export interface CourseAssignment {
  id: number;
  course_id: number;
  chapter_id: number;
  title: string;
  instructions: string;
  attachments: AssignmentAttachment[] | null;
  is_published: boolean;
  total_marks: number;
  minimum_pass_marks: number;
  time_limit: number;
  time_limit_option: AssignmentTimeLimitOption;
  file_upload_limit: number;
  deadline_at?: string | null;
  seconds_remaining?: number | null;
  max_file_size_bytes?: number;
  allowed_mime_types?: string[];
  max_response_text_length?: number;
}

export interface StudentAssignmentDetail extends CourseAssignment {
  has_submitted: boolean;
  can_submit: boolean;
  can_edit: boolean;
  started_at?: string | null;
  submission: AssignmentSubmissionSummary | null;
}

export interface DashboardAssignmentItem {
  courseSlug: string;
  courseTitle: string;
  chapterTitle: string;
  assignment: CourseAssignment;
  submission?: AssignmentSubmissionSummary;
}

export interface CourseChapter {
  id: number;
  position: number;
  title: string;
  description?: string | null;
  course_lessons?: CourseLesson[];
  assignments?: CourseAssignment[];
  quizzes?: CourseQuizSummary[];
}

export interface CourseQuizSummary {
  id: number;
  title: string;
  instructions?: string;
  is_published: boolean;
  time_limit?: number;
  time_limit_option?: string;
  total_visible_questions?: number;
  chapter_id?: number;
  course_id?: number;
}

export type QuizQuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "fill_blank"
  | "open_ended";

export interface QuizQuestionOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  title: string;
  details: string;
  type: QuizQuestionType;
  marks: number;
  options?: QuizQuestionOption[];
  answer_explanation: string | null;
  answer_required: boolean;
  media?: unknown[];
  created_at: string;
  updated_at: string;
}

export interface StudentQuizDetail {
  id: number;
  title: string;
  instructions: string;
  minimum_pass_percentage: number;
  enable_retry: boolean;
  retry_attempts: number;
  randomize_questions: boolean;
  reveal_answers: boolean;
  single_quiz_view: boolean;
  time_limit: number;
  time_limit_option: string;
  total_visible_questions: number;
  is_published: boolean;
  chapter_id: number;
  course_id: number;
  questions: QuizQuestion[];
  attempts_used: number;
  can_retry: boolean;
  attempt_number?: number;
  display_mode?: "all" | "single";
  total_questions?: number;
  current_question_index?: number;
  started_at?: string | null;
  expires_at?: string | null;
  seconds_remaining?: number | null;
}

export interface QuizAnswerPayload {
  question_id: number;
  value: string | boolean | string[];
}

export interface QuizSubmissionAnswer {
  question_id: number;
  question_title: string;
  question_type: QuizQuestionType;
  submitted_answer: string | boolean | string[];
  is_correct: boolean | null;
  marks_awarded: number;
  correct_answer?: { value: string | boolean } | { values: string[] };
  answer_explanation?: string | null;
}

export interface QuizSubmissionResult {
  id: number;
  quiz_title: string;
  attempt_number: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  status: "graded" | "pending_review";
  submitted_at: string;
  reveal_answers: boolean;
  answers?: QuizSubmissionAnswer[];
  total_questions?: number;
  correct_count?: number;
  incorrect_count?: number;
  unanswered_count?: number;
  pass_marks?: number;
  minimum_pass_percentage?: number;
  instructor_feedback?: string | null;
}

export interface QuizSubmissionRecord {
  id: number;
  quiz_id: number;
  quiz_title: string;
  course_id?: number;
  course_title?: string;
  chapter_title?: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  status: "graded" | "pending_review";
  submitted_at: string;
  attempt_number?: number;
}

export interface DashboardQuizItem {
  courseSlug: string;
  courseTitle: string;
  chapterTitle: string;
  quiz: CourseQuizSummary;
  latestSubmission?: QuizSubmissionRecord;
}

export interface CourseProgressData {
  lessons_completed: number;
  lessons_total: number;
  quizzes_completed: number;
  quizzes_total: number;
  assignments_completed: number;
  assignments_total: number;
  progress_percent: number;
  count_lessons: boolean;
  count_quizzes: boolean;
  count_assignments: boolean;
  completed_lesson_ids: number[];
  completed_quiz_ids?: number[];
}

export interface LessonVideoProgressData {
  lesson_id: number;
  max_position_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  completed: boolean;
  updated_at: string;
}

export interface AcademicNoteClass {
  id: number;
  title: string;
  slug: string;
  icon_label: string;
  icon_color: string;
  position: number;
  note_count: number;
}

export interface AcademicNotePaper {
  id: number;
  subject_id: number;
  title: string;
  slug: string;
  icon_label: string;
  icon_color: string;
  position: number;
  note_count: number;
}

export interface AcademicNoteSubject {
  id: number;
  class_id: number;
  title: string;
  slug: string;
  position: number;
  note_count: number;
  papers: AcademicNotePaper[];
}

export interface AcademicNoteClassDetail extends AcademicNoteClass {
  subjects: AcademicNoteSubject[];
}

export interface AcademicNote {
  id: number;
  paper_id: number;
  title: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  pdf_url: string;
  pdf_file_name: string;
  position: number;
}

export interface AcademicNotePaperDetail {
  class: Pick<
    AcademicNoteClass,
    "id" | "title" | "slug" | "icon_label" | "icon_color"
  >;
  subject: Pick<
    AcademicNoteSubject,
    "id" | "class_id" | "title" | "slug" | "note_count"
  >;
  paper: Pick<
    AcademicNotePaper,
    | "id"
    | "subject_id"
    | "title"
    | "slug"
    | "icon_label"
    | "icon_color"
    | "note_count"
  >;
  notes: AcademicNote[];
}

export interface CourseGeneralSettings {
  difficulty_level?: string | null;
  language?: string | null;
  duration?: string | null;
  category?: Category;
}

export interface Instructor {
  id: number;
  first_name: string;
  last_name?: string | null;
  email: string;
  image: string | null;
  designation: string;
  phone?: string | null;
}

export interface CourseDetails {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description?: string | null;
  featured_image?: string | null;
  pricing_model: PricingModel;
  regular_price?: number | null;
  sale_price?: number | null;
  course_chapters: CourseChapter[];
  general_settings?: CourseGeneralSettings;
  course_instructors?: { instructor: Instructor }[];
  author?: {
    first_name?: string;
    last_name?: string | null;
  };
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  course: CourseDetails;
  created_at: string;
}

export interface PaymentMethod {
  id: number;
  title: string;
  image: string | null;
  instruction: string;
}

export interface LoginResponse {
  token: string;
  user: Student;
}

export interface Certificate {
  id: number;
  course_id: number;
  course_title: string;
  certificate_number: string;
  student_name: string;
  progress_percent: number;
  template_path: string;
  title?: string | null;
  subtitle_one?: string | null;
  subtitle_two?: string | null;
  brand_logo?: string | null;
  watermark_image?: string | null;
  watermark_opacity?: number;
  organization_name?: string | null;
  signer_name?: string | null;
  signer_role?: string | null;
  signer_org?: string | null;
  dual_signers_enabled?: boolean;
  signer2_name?: string | null;
  signer2_role?: string | null;
  signer2_org?: string | null;
  pricing_model?: PricingModel;
  owner_signature?: string | null;
  instructor_signature?: string | null;
  issued_at: string;
  download_url?: string;
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface FreeLessonCatalogApiItem {
  lesson_id: number;
  lesson_title: string;
  chapter_id?: number;
  chapter_title: string;
  course_id: number;
  course_slug: string;
  course_title: string;
  featured_image?: string | null;
  lesson_type?: string;
  source_type: string;
  source?: { data?: { data?: string; is_file?: boolean } } | null;
  is_public?: boolean;
  class_slugs?: string[];
  duration_seconds?: number | null;
}

export interface FreeLessonLibraryApiItem extends FreeLessonCatalogApiItem {
  added_at?: string;
  watch_percent?: number;
  watch_seconds?: number;
  duration_seconds?: number | null;
  completed?: boolean;
}

export interface FreeLessonsMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface CourseReviewStudent {
  id: number;
  first_name: string;
  last_name?: string | null;
  profile_image?: string | null;
}

export interface CourseReview {
  id: number;
  course_id: number;
  student_id: number;
  rating: number;
  comment?: string | null;
  tags?: string[];
  student?: CourseReviewStudent;
  created_at: string;
  updated_at: string;
}

export interface CourseReviewsSummary {
  average_rating: number;
  total_reviews: number;
  reviews: CourseReview[];
  student_review?: CourseReview | null;
  can_review?: boolean;
}

export interface SubmitCourseReviewPayload {
  rating: number;
  comment?: string;
  tags?: string[];
}

export type LearningReportPeriod = "7d" | "30d" | "90d";

export interface DailyWatchSeconds {
  date: string;
  seconds: number;
}

export interface StudentLearningReportData {
  period: LearningReportPeriod;
  daily_watch_seconds: DailyWatchSeconds[];
  streak_days: number;
  quiz_accuracy_percent: number;
  courses_in_progress: number;
  courses_completed: number;
}

export type WatchTimeSource = "enrolled" | "free_lesson" | "offline";

export interface WatchTimeEventPayload {
  client_event_id: string;
  watched_seconds: number;
  watch_date: string;
  timezone: string;
  watched_at?: string;
  course_id?: number;
  lesson_id?: number;
  source?: WatchTimeSource;
  device_platform?: "ios" | "android" | "web";
}

export interface WatchTimeAcceptData {
  accepted: boolean;
  watch_date: string;
  day_video_seconds: number;
  duplicate: boolean;
  client_event_id?: string;
}

export interface WatchTimeBatchData {
  accepted_count: number;
  duplicate_count: number;
  results: WatchTimeAcceptData[];
  daily_totals: DailyWatchSeconds[];
}

export interface StudentNotification {
  id: number;
  title: string;
  body?: string | null;
  message?: string | null;
  type?: string | null;
  link?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface StudentOrder {
  id: number;
  course_id: number;
  course_title: string;
  invoice_id?: number | string | null;
  total: number;
  payment_method?: string | null;
  transaction_id?: string | null;
  status?: string | null;
  payment_status?: string | null;
  created_at: string;
  customer_note?: string | null;
}

export type SessionReplacedBody = {
  code?: string;
  message?: string;
  error?: string;
};
