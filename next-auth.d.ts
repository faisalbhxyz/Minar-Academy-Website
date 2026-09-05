declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken?: string;
    user: {
      user_id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      permissions: string[];
      first_name?: string;
      last_name?: string | null;
      profile_image?: string | null;
    };
  }
}

export {};
