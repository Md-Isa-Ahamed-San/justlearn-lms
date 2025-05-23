import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { authConfig } from "./auth.config";
import { db } from "./lib/prisma";

// Function to generate custom JWT tokens for credentials login
function generateTokens(user) {
  const accessTokenPayload = {
    userId: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    type: "access",
  };

  const refreshTokenPayload = {
    userId: user.id,
    email: user.email,
    type: "refresh",
  };

  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: "1m" } // 1 minute for testing
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "3m" } // 3 minutes for testing
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpires: Date.now() + 60 * 1000, // 1 minute from now
  };
}

// Function to refresh access token for credentials
async function refreshCredentialsToken(token) {
  try {
    console.log("Refreshing credentials token...");

    // Verify the refresh token
    const decoded = jwt.verify(
      token.refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // Get user from database to ensure they still exist
    const user = await db.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        type: "access",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1m" } // 1 minute for testing
    );

    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: Date.now() + 60 * 1000, // 1 minute from now
      user: {
        ...user,
        name: `${user.firstName} ${user.lastName}`,
        image: user.profilePicture,
      },
    };
  } catch (error) {
    console.error("Error refreshing credentials token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// Function to refresh Google access token (your existing implementation)
async function refreshGoogleAccessToken(token) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens?.access_token,
      accessTokenExpires: Date.now() + refreshedTokens?.expires_in * 1000,
      refreshToken: refreshedTokens?.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.log("Google token refresh error:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  providers: [
     CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isMatch) throw new Error("Invalid password");

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log(`JWT token: ${JSON.stringify(token)}`);
      console.log(`JWT Account: ${JSON.stringify(account)}`);

      // Initial sign in
      if (account && user) {
        if (account.provider === "google") {
          // Google OAuth flow
          return {
            accessToken: account.access_token,
            accessTokenExpires: Date.now() + account.expires_in * 1000,
            refreshToken: account.refresh_token,
            provider: "google",
            user,
          };
        } else if (account.provider === "credentials") {
          // Credentials flow - generate our own tokens
          const tokens = generateTokens(user);
          return {
            accessToken: tokens.accessToken,
            accessTokenExpires: tokens.accessTokenExpires,
            refreshToken: tokens.refreshToken,
            provider: "credentials",
            user,
          };
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token?.accessTokenExpires) {
        console.log(
          `⏰ At ${new Date(
            Date.now()
          )}, Using old access token (expires: ${new Date(
            token.accessTokenExpires
          )})`
        );
        return token;
      }

      // Access token has expired, try to update it
      console.log(`⚠️ Token expired at ${new Date(Date.now())}, refreshing...`);
      console.log(`📊 Token expiry was: ${new Date(token.accessTokenExpires)}`);

      if (token.provider === "google") {
        return refreshGoogleAccessToken(token);
      } else if (token.provider === "credentials") {
        return refreshCredentialsToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      session.user = token?.user;
      session.accessToken = token?.accessToken;
      session.error = token?.error;
      session.provider = token?.provider;

      console.log(`Returning Session ${JSON.stringify(session)}`);
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
