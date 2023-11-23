import NextAuth from "next-auth";
// Moralis Auth Provider
import { MoralisNextAuthProvider } from "@moralisweb3/next";
// Hydra OAuth Config
import { hydraAdmin } from '../../../src/hydra_config.ts';

export const authOptions = {
  providers: [MoralisNextAuthProvider()],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },

    // signIn callback.
    // This executes upon successful signIn on the login page
    // Moralis Verify EVM Challenge returns a 'user' object complete
    // with the unique address the user is using. We ignore 'profile' in
    // this response.
    
  },
};

export default NextAuth(authOptions);