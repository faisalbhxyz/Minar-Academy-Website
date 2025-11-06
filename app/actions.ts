"use server";

import { signIn, signOut } from "@/lib/auth";
import axiosInstance from "@/lib/axiosInstance";
import { Session } from "next-auth";

export const doCretendentialLogin = async (email: string, password: string) => {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error: any) {
    return {
      error: error.cause?.err.response.data.message || "Something went wrong.",
    };
  }
};

export const doCretendentialLogout = async () => {
  await signOut();
};

export const getAllCourses = async (
  showItems?: number
): Promise<CourseDetails[]> => {
  try {
    const queryParam = showItems ? `showItems=${showItems}` : `showItems=all`;

    const res = await axiosInstance.get(`/course?${queryParam}`, {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
};

export const getCourseBySlug = async (
  slug: string
): Promise<CourseDetails | null> => {
  try {
    const res = await axiosInstance.get(`/course/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const res = await axiosInstance.get("/category", {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getStudentDetails = async (session: Session): Promise<Student> => {
  try {
    const res = await axiosInstance.get("/student/details", {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return res.data.data;
  } catch (error) {
    return {} as Student;
  }
};

export const getStudentEnrollments = async (
  session: Session
): Promise<Enrollment[]> => {
  try {
    const res = await axiosInstance.get("/enrolled/courses", {
      headers: {
        "Content-Type": "application/json",
        "app-key": process.env.NEXT_PUBLIC_APP_KEY,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    return res.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};
