import NextAuth from "next-auth";
import { MoralisNextAuthProvider } from "@moralisweb3/next";
import { Configuration, OAuth2Api } from "@ory/hydra-client";
import { hydraAdmin } from '../../../src/hydra_config.ts';


export default NextAuth({
  providers: [MoralisNextAuthProvider()],
  // adding user info to the user session object
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      console.log("BACKEND jwt");
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      console.log("BACKEND session");
      return session;
    },
    async signIn(user, account, profile){
      console.log("BACKEND signIn");
      console.log(user);
      
      let payload = JSON.parse(user.user.payload);
      let login_challenge = payload.login_challenge;
      console.log(login_challenge);
      let address = user.user.address;
      console.log(address);

      // Try to accept login request with hydra
      if(user){
        try {
          console.log(login_challenge);
          var options = {subject: String(address),};
          
          let accpt_req = await hydraAdmin.acceptOAuth2LoginRequest(login_challenge,{subject: address,});
  
        }
        catch (error) {
          console.log(error);
          console.log(error.message);
          console.log("Subject: ",address);
        }
        
        console.log("ACCEPT LOGIN REQUEST");
        console.log(accpt_req);
        
        /*
        hydraAdmin.acceptOAuth2LoginRequest(login_challenge, {
          // All we need to do is to confirm that we indeed want to log in the user.
          subject: String(body.subject),
        })
        */
        console.log("Subject: %s" % (address));

      }
      
      return true;
    },
  },
});