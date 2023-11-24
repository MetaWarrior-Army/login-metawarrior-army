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
  },
};

export default NextAuth(authOptions);