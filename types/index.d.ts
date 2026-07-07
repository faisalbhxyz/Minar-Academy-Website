type Course = {
  id: number;
  title: string;
  authorized: string;
  price: string;
  listPrice: string;
  image: string;
  category: string;
  tag: string[];
};

type Visibility = "public" | "private" | "protected";

type PricingModel = "free" | "paid";

type DifficultyLevel = "all" | "beginner" | "intermediate" | "expert";

type Access = "draft" | "published";

type LessonType = "video" | "live_session" | "audio" | "text";

type LessonSourceType =
  | "youtube"
  | "vimeo"
  | "custom_code"
  | "upload"
  | "sound_cloud"
  | "spotify";

interface IntroVideo {
  type: string;
  source: string;
}

interface Source {
  data: string;
  is_file: boolean;
  playback_times?: string | null;
}

interface CourseDetails {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description?: string | null;
  visibility: Visibility;
  is_scheduled?: boolean | null;
  schedule_date?: string | null; // ISO date string
  schedule_time?: string | null; // ISO time string or string format
  featured_image?: string | null;
  intro_video?: { data: IntroVideo } | null;
  pricing_model: PricingModel;
  regular_price?: number | null;
  sale_price?: number | null;
  show_comming_soom?: boolean | null;
  tags: any; // JSON stored as any, adjust if you know the shape
  overview: any; // JSON stored as any, adjust if you know the shape
  author_id: number;
  author: IUser; // You will need to define this interface separately
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  tenant_id?: number;
  tenant?: Tenant; // Define Tenant interface separately if needed
  course_chapters: CourseChapter[];
  general_settings: CourseGeneralSettings;
  course_instructors: CourseInstructor[];
}

interface CourseChapter {
  id: number;
  position: number;
  title: string;
  description?: string | null;
  access: Access;
  created_at: string;
  updated_at: string;
  course_id: number;
  course_lessons?: CourseLesson[];
  assignments?: CourseAssignment[];
  quizzes?: CourseQuiz[];
}

interface LessonResource {
  id: number;
  course_id: number;
  lesson_id: number;
  mime_type: string;
  title: string;
  file_path: string;
  position: number;
  file_size: number;
  created_at: Date;
  updated_at: Date;
}

interface CourseLesson {
  id: number;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  source_type: LessonSourceType;
  source: { data: Source };
  is_published: boolean;
  is_public: boolean;
  resources?: LessonResource[] | null; // filename, mimetype, url, size
  position: number;
  created_at: string;
  updated_at: string;
  chapter_id: number;
}

interface AssignmentAttachment {
  id?: number;
  url: string;
  file_name: string;
  mime_type: string;
  size: number;
}

interface AssignmentSubmissionSummary {
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

interface StudentAssignmentDetail extends CourseAssignment {
  has_submitted: boolean;
  can_submit: boolean;
  can_edit: boolean;
  started_at?: string | null;
  submission: AssignmentSubmissionSummary | null;
}

interface AssignmentSubmissionRecord {
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

interface DashboardAssignmentItem {
  courseSlug: string;
  courseTitle: string;
  chapterTitle: string;
  assignment: CourseAssignment;
  submission?: AssignmentSubmissionSummary;
}

interface CourseAssignment {
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
  time_limit_option: "minutes" | "hours" | "days" | "weeks" | "months";
  file_upload_limit: number;
  deadline_at?: string | null;
  seconds_remaining?: number | null;
  max_file_size_bytes?: number;
  allowed_mime_types?: string[];
  max_response_text_length?: number;
  created_at: string;
  updated_at: string;
}
interface CourseQuiz {
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
  created_at: string;
  updated_at: string;
  questions: QuizQuestion[];
}

type QuizQuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "fill_blank"
  | "open_ended";

interface QuizQuestionOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: number;
  quiz_id: number;
  title: string;
  details: string;
  type: QuizQuestionType;
  marks: number;
  options?: QuizQuestionOption[];
  answer_explanation: string | null;
  answer_required: boolean;
  media: any[];
  created_at: string;
  updated_at: string;
}

interface StudentQuizDetail extends CourseQuiz {
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

interface QuizQuestionPageResponse {
  question_index: number;
  total_questions: number;
  display_mode: "single";
  started_at?: string | null;
  expires_at?: string | null;
  seconds_remaining?: number | null;
  id: number;
  quiz_id: number;
  title: string;
  details: string;
  type: QuizQuestionType;
  marks: number;
  options?: QuizQuestionOption[];
  answer_required: boolean;
  media: any[];
  created_at: string;
  updated_at: string;
}

type StudentQuizFetchResult =
  | { ok: true; quiz: StudentQuizDetail }
  | { ok: false; status: number; message: string };

interface QuizAnswerPayload {
  question_id: number;
  value: string | boolean | string[];
}

interface QuizSubmissionAnswer {
  question_id: number;
  question_title: string;
  question_type: QuizQuestionType;
  submitted_answer: string | boolean | string[];
  is_correct: boolean | null;
  marks_awarded: number;
  correct_answer?: { value: string | boolean } | { values: string[] };
  answer_explanation?: string | null;
}

interface QuizSubmissionResult {
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
  answers: QuizSubmissionAnswer[];
  total_questions?: number;
  correct_count?: number;
  incorrect_count?: number;
  unanswered_count?: number;
  pass_marks?: number;
  minimum_pass_percentage?: number;
  quiz_time_seconds?: number;
  attempt_time_seconds?: number;
  instructor_feedback?: string | null;
}

interface QuizSubmissionRecord {
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

interface DashboardQuizItem {
  courseSlug: string;
  courseTitle: string;
  chapterTitle: string;
  quiz: CourseQuiz;
  latestSubmission?: QuizSubmissionRecord;
}

interface CourseGeneralSettings {
  id: number;
  course_id: number;
  difficulty_level?: DifficultyLevel | null;
  maximum_student?: number | null;
  language?: string | null;
  category_id: number;
  category: Category; // Define Category interface separately
  duration?: string | null;
  created_at: string;
  updated_at: string;
}

interface CourseInstructor {
  id: number;
  course_id: number;
  instructor_id: number;
  instructor: Instructor; // Define Instructor interface separately
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
  sub_categories?: Category[];
}
interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

interface Instructor {
  id: number;
  user_id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email: string;
  status: string;
  image: string | null;
  role: string;
  designation: string;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: number;
  user_id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email: string;
  profile_image?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  enrollments: {
    id: number;
    course_id: number;
    student_id: number;
  }[];
}

interface Enrollment {
  id: number;
  student_id: number;
  student: Pick<IStudent, "id" | "first_name" | "last_name" | "email">;
  course_id: number;
  course: CourseDetails;
  created_at: string;
  updated_at: string;
}

interface CourseProgressData {
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

interface Banner {
  id: number;
  title: string;
  image: string;
  url: string;
  created_at: Date;
  updated_at: Date;
}

interface IPaymentMethod {
  id: number;
  title: string;
  image: string | null;
  instruction: string;
  created_at: Date;
  updated_at: Date;
}

interface AcademicNoteClass {
  id: number;
  title: string;
  slug: string;
  icon_label: string;
  icon_color: string;
  position: number;
  note_count: number;
}

interface AcademicNotePaper {
  id: number;
  subject_id: number;
  title: string;
  slug: string;
  icon_label: string;
  icon_color: string;
  position: number;
  note_count: number;
}

interface AcademicNoteSubject {
  id: number;
  class_id: number;
  title: string;
  slug: string;
  position: number;
  note_count: number;
  papers: AcademicNotePaper[];
}

interface AcademicNoteClassDetail extends AcademicNoteClass {
  subjects: AcademicNoteSubject[];
}

interface AcademicNote {
  id: number;
  paper_id: number;
  title: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  pdf_url: string;
  pdf_file_name: string;
  position: number;
}

interface Certificate {
  id: number;
  course_id: number;
  course_title: string;
  certificate_number: string;
  student_name: string;
  progress_percent: number;
  template_path: string;
  title: string | null;
  subtitle_one: string | null;
  subtitle_two: string | null;
  owner_signature: string | null;
  instructor_signature: string | null;
  issued_at: string;
}

interface AcademicNotePaperDetail {
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
