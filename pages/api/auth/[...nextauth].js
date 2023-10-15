import NextAuth from "next-auth";
// Moralis Auth Provider
import { MoralisNextAuthProvider } from "@moralisweb3/next";
// Hydra OAuth Config
import { hydraAdmin } from '../../../src/hydra_config.ts';


export default NextAuth({
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

    async signIn(user, account, profile){
      console.log("NextAuth signIn Callback");

      let payload = JSON.parse(user.user.payload);
      let login_challenge = payload.login_challenge;
      let address = user.user.address;

      try {
        var accpt_res = await hydraAdmin.acceptOAuth2LoginRequest({loginChallenge: login_challenge, acceptOAuth2LoginRequest: {'subject': address, remember: true,}});
      }
      catch (error) {
        console.log(error.message);
        console.log("Subject: ",address);
      }
      
      return accpt_res.data.redirect_to;

    },
  },
});