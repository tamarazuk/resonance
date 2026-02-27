import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import { compare } from "bcryptjs";
import { db, users, accounts } from "@resonance/db";
import { loginSchema } from "@resonance/types";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    fullName: string | null;
  }

  interface Account {
    provider: string;
    providerAccountId: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;

          const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
          });

          if (!user) return null;
          if (!user.passwordHash) return null;

          const passwordMatch = await compare(password, user.passwordHash);
          if (!passwordMatch) return null;

          return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
          };
        } catch (error) {
          console.error("Credentials authorize failed", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, user.email),
      });

      if (existingUser) {
        await db
          .insert(accounts)
          .values({
            userId: existingUser.id,
            type: account.type ?? "oauth",
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refreshToken: account.refresh_token ?? null,
            accessToken: account.access_token ?? null,
            expiresAt: account.expires_at
              ? new Date(account.expires_at * 1000)
              : null,
            tokenType: account.token_type ?? null,
            scope: account.scope ?? null,
            idToken: account.id_token ?? null,
          })
          .onConflictDoNothing({
            target: [accounts.provider, accounts.providerAccountId],
          });
        user.id = existingUser.id;
        return true;
      }

      const [newUser] = await db
        .insert(users)
        .values({
          email: user.email,
          fullName: user.name,
        })
        .returning({ id: users.id });

      await db.insert(accounts).values({
        userId: newUser.id,
        type: account.type ?? "oauth",
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refreshToken: account.refresh_token ?? null,
        accessToken: account.access_token ?? null,
        expiresAt: account.expires_at
          ? new Date(account.expires_at * 1000)
          : null,
        tokenType: account.token_type ?? null,
        scope: account.scope ?? null,
        idToken: account.id_token ?? null,
      });

      user.id = newUser.id;

      return true;
    },
    jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id as string;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      return session;
    },
  },
});
