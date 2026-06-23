import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      login?: string | null;
      image?: string | null;
      role: string;
      origin?: string | null;
    };
  }

  interface User {
    login?: string;
    role?: string;
    origin?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    login?: string;
    origin?: string;
  }
}
