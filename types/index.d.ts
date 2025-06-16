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
  summary: string;
  description?: string | null;
  visibility: Visibility;
  is_scheduled?: boolean | null;
  schedule_date?: string | null; // ISO date string
  schedule_time?: string | null; // ISO time string or string format
  featured_image?: string | null;
  intro_video?: IntroVideo | null;
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
  course_lessons: CourseLesson[];
}

interface CourseLesson {
  id: number;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  source_type: LessonSourceType;
  source: Source;
  is_published: boolean;
  is_public: boolean;
  resources?: Record<string, string> | null; // filename, mimetype, url, size
  position: number;
  created_at: string;
  updated_at: string;
  chapter_id: number;
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
}

interface Instructor {
  id: number;
  user_id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
}