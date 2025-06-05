import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { db } from "./lib/prisma";
import { chalkLog } from "./utils/logger";

// Function to generate custom JWT tokens for credentials login
function generateTokens(user) {
  const accessTokenPayload = {
    userId: user.id,
    email: user.email,
    name: `${user.name}`,
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
    { expiresIn: "15m" } // 15 minute for testing
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "1d" } // 1 day for testing
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpires: Date.now() + 60 * 1000 * 15, // 15 minute from now because currently 15 min set
  };
}

// Function to refresh access token for credentials
async function refreshCredentialsToken(token) {
  try {
    // console.log("Refreshing credentials token...");

    // Verify the refresh token
    const decoded = jwt.verify(
      token.refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // Get user from database to ensure they still exist
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: `${user.name}`,
        type: "access",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // 1 day for testing
    );

    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: Date.now() + 60 * 1000*15, // 15 minute from now
      user: {
        ...user,
        name: `${user.name}`,
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
      accessTokenExpires: Date.now() + refreshedTokens?.expires_in * 1000*15, //expires in 15 min
      refreshToken: refreshedTokens?.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    // console.log("Google token refresh error:", error);
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
      // console.log(`JWT token: ${JSON.stringify(token)}`);
      // console.log(`JWT Account: ${JSON.stringify(account)}`);
      //  chalkLog.structured(token)
      //  chalkLog.structured(account)
      // chalkLog.log("token",token);
      // chalkLog.log("account",account);
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
      // console.log(`⚠️ Token expired at ${new Date(Date.now())}, refreshing...`);
      // console.log(`📊 Token expiry was: ${new Date(token.accessTokenExpires)}`);

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

    async signIn({ user, account, profile }) {
      console.log("🔐 SignIn callback triggered");
      console.log("Provider:", account?.provider);
      console.log("User data:", user);

      // 🎯 THIS IS THE GOOGLE SIGNIN LOGIC
      if (account?.provider === "google") {
        try {
          console.log("🚀 Processing Google OAuth signin for:", user.email);

          // Check if user already exists in your database
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // 🆕 CREATE NEW USER FOR GOOGLE OAUTH
            console.log("Creating new Google user in database...");
            const newUser = await db.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                provider: "google",
                providerId: account.providerAccountId,
                // Note: no password field for OAuth users
              },
            });
            console.log("✅ Successfully created Google user:", newUser);
          } else {
            console.log("✅ Google user already exists:", existingUser.email);

            // Optionally update user info from Google
            await db.user.update({
              where: { email: user.email },
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                provider: "google",
                providerId: account.providerAccountId,
              },
            });
          }

          return true; // Allow signin
        } catch (error) {
          console.error("❌ Error creating/updating Google user:", error);
          return false; // Deny signin
        }
      }

      // For credentials provider, user is already validated in authorize()
      if (account?.provider === "credentials") {
        try {
          console.log("🚀 Processing credentials signin for:", user.email);

          // Update the credentials user to set provider info
          const updatedUser = await db.user.update({
            where: { email: user.email },
            data: {
              provider: "credentials",
              providerId: user.id, // Use the user's database ID as providerId for credentials
              // Alternatively, you could use: providerId: `credentials_${user.id}`
            },
          });

          // console.log("✅ Updated credentials user with provider info:", updatedUser.email);
          return true;
        } catch (error) {
          console.error("❌ Error updating credentials user:", error);
          // Don't block signin for this - it's not critical
          return true;
        }
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
