// Extiende los tipos de next-auth con campos custom
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      onboardingDone: boolean;
      onboardingStep: number;
    };
  }
  interface User {
    id: string;
    role?: string;
    onboardingDone?: boolean;
    onboardingStep?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: string;
    onboardingDone?: boolean;
    onboardingStep?: number;
  }
}
