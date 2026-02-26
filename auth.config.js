export const authConfig = {
    session: {
     strategy: 'jwt',
    },
    providers: [],
    callbacks: {
      async jwt({ token, user, account }) {
        // On initial sign-in, the user object is available
        if (user) {
          token.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role ?? null,
          };
        }
        return token;
      },
      async session({ session, token }) {
        // Forward token.user (which includes role) into session.user
        session.user = token?.user || session.user;
        session.accessToken = token?.accessToken;
        session.provider = token?.provider;
        return session;
      },
    },
 }
