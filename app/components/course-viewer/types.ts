"use client";

// --- EXTERNAL INTERFACES (from your index.d.ts) ---
// Minimal placeholders. Replace with your actual interfaces.
export interface IUser {
  id: number;
  name: string;
  designation?: string | null;
}
export interface Tenant {
  id: number;
  name: string;
}

export type Visibility = "public" | "private" | "draft"; // Example values
export type PricingModel = "free" | "paid" | "subscription"; // Example values
export type IntroVideo = {
  // Define properties of IntroVideo if known
  // e.g., url: string;
};

export type Access = "free" | "paid"; // Example values
export type LessonType = "video" | "text" | "quiz" | "assignment"; // Example values
export type LessonSourceType =
  | "youtube"
  | "vimeo"
  | "external_url"
  | "upload"
  | "iframe"; // Example values

export interface Source {
  data: string;
  is_file: boolean;
  playback_times?: string | null;
}

export interface CourseDetails {
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
  general_settings: any; // Simplified, adjust if you have a CourseGeneralSettings interface
  course_instructors: any[]; // Simplified, adjust if you have a CourseInstructor interface
}
export interface CourseChapter {
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
export interface CourseLesson {
  id: number;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  source_type: LessonSourceType;
  source: { data: Source };
  is_published: boolean;
  is_public: boolean;
  resources?: Record<string, string> | null; // filename, mimetype, url, size
  position: number;
  created_at: string;
  updated_at: string;
  chapter_id: number;
}
export interface CourseAssignment {
  id: number;
  course_id: number;
  chapter_id: number;
  title: string;
  instructions: string;
  attachments: any | null;
  is_published: boolean;
  total_marks: number;
  minimum_pass_marks: number;
  time_limit: number;
  time_limit_option: "minutes" | "hours" | "days" | "weeks" | "months";
  file_upload_limit: number;
  created_at: string;
  updated_at: string;
}
export interface CourseQuiz {
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
  questions: any[]; // QuizQuestion[];
}

// --- INTERNAL COMPONENT TYPES ---

export type Lesson = {
  id: number;
  title: string;
  duration: string; // e.g., "04:35"
  completed: boolean;
  videoSource: {
    type: "youtubeId" | "iframe" | "none"; // 'none' for lessons that are not video
    value: string; // YouTube video ID or full iframe HTML
  };
  description?: string | null;
  resources?: Record<string, string> | null;
};

export type Chapter = {
  id: number;
  title: string;
  lessons: Lesson[];
  totalLessons: number;
  completedLessons: number;
};

export type CourseViewerProps = {
  courseDetails: CourseDetails; // Pass the whole CourseDetails object
  userCompletedLessonIds: Set<number>; // Set of IDs of lessons completed by the user
};

export type ChapterItemProps = {
  chapter: Chapter;
  activeLesson: Lesson | null;
  setActiveLesson: (lesson: Lesson) => void;
};

export type LessonItemProps = {
  lesson: Lesson;
  isActive: boolean;
  onClick: () => void;
};
