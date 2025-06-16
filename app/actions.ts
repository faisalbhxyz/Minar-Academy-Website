"use server";

import axiosInstance from "@/lib/axiosInstance";

export const getAllCourses = async (): Promise<CourseDetails[]> => {
  try {
    const res = await axiosInstance.get("/public/course", {
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

export const getCourseByID = async (id: number): Promise<CourseDetails | null> => {
  try {
    const res = await axiosInstance.get(`/public/course/${id}`, {
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
