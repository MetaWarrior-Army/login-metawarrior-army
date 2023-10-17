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

    // signIn callback.
    // This executes upon successful signIn on the login page
    // Moralis Verify EVM Challenge returns a 'user' object complete
    // with the unique address the user is using. We ignore 'profile' in
    // this response.
    async signIn(user, account, profile){
      console.log("NextAuth signIn Callback");

      // parse payload for login_challenge
      const payload = JSON.parse(user.user.payload);
      const login_challenge = payload.login_challenge;

      try {
        var accpt_res = await hydraAdmin.acceptOAuth2LoginRequest({loginChallenge: login_challenge, acceptOAuth2LoginRequest: {'subject': user.user.address, remember: true, remember_for: 3600,}});
      }
      catch (error) {
        console.log(error.message);
        console.log("Subject: ",address);
      }
      
      return accpt_res.data.redirect_to;

    },
  },
});