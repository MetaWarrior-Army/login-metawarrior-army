'use server'
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { getSession, signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/router";
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";

import { hydraAdmin } from '../src/hydra_config.ts';

function SignIn({ login_challenge }) {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { requestChallengeAsync } = useAuthRequestChallengeEvm();
  const { push } = useRouter();
  
  console.log("LOGIN CHALLENGE");
  console.log({login_challenge});
  
  const handleAuth = async () => {
    // if connected, disconnect
    if (isConnected) {
      await disconnectAsync();
    }

    // fire up metamask
    const { account, chain } = await connectAsync({
      connector: new MetaMaskConnector(),
    });
    // Request the user to login
    const { message } = await requestChallengeAsync({
      address: account,
      chainId: chain.id,
    });
    // Request user sign message
    const signature = await signMessageAsync({ message });

    // Sign into moralis, get callback URL
    // create a session nonce for this so we can authenticate the user 
    // on their return and send them to accept the OAuth2 Login Request.
    // Or post the params below to a new page to perform the OAuth2 Login Accept.
    const options = {
      message,
      signature,
      redirect: false,
      callbackUrl: "/user",
      payload: JSON.stringify({login_challenge: login_challenge}),
    };
    var callback = await signIn("moralis-auth", options);
    console.log(callback);

    

    /**
    * instead of using signIn(..., redirect: "/user")
    * we get the url from callback and push it to the router to avoid page refreshing
    */
    if(callback){
      console.log(callback.url);
      push(callback.url);
    }
    else{
      console.log(callback);
    }
  };

  return (
    <div>
      <h3>Web3 Authentication</h3>
      <button onClick={handleAuth}>Authenticate via Metamask</button>
    </div>
  );
}

export const getServerSideProps = (async (context) => {
  console.log(context.req.method);
  const {login_challenge, message, signature} = context.query;

  try {
    const login_req = await hydraAdmin.getOAuth2LoginRequest({loginChallenge: login_challenge});
    console.log(login_req);
  }
  catch (error){
    console.log(error);
    return {props: {}};
  }
  


  return {props: {login_challenge}};
  

});

export default SignIn;