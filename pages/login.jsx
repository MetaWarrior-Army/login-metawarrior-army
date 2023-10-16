// Web3 helpers
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
// Moralis API
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";
// NextJS helpers
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
// Hydra OAuth2 Config
import { hydraAdmin } from '../src/hydra_config.ts';

// SignIn Page
function SignIn({ login_challenge }) {
  const { connectAsync, connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { requestChallengeAsync } = useAuthRequestChallengeEvm();
  const { push } = useRouter();
  
  const connectorLogin = async ({connector}) => {
    // if connected, disconnect
    if (isConnected) {
      await disconnectAsync();
    }

    // get account and chain data
    const { account, chain } = await connectAsync({connector});

    // Request the user to login
    const { message } = await requestChallengeAsync({
      address: account,
      chainId: chain.id,
    });
    // Request user sign message
    const signature = await signMessageAsync({ message });

    // Sign into moralis, get callback URL
    const options = {
      message,
      signature,
      redirect: false,
      callbackUrl: "/user",
      payload: JSON.stringify({login_challenge: login_challenge}),
    };
    var callback = await signIn("moralis-auth", options);
    
    if(callback){
      push(callback.url);
    }
    else {
      console.log("Failed to sign-in");
    }
  }
  
  

  return (
    <>
        <h3>Choose a wallet to login with</h3>
        <div className="container left-align">
  
        {connectors.map((connector) => (
          <button type="button" className="btn btn-outline-secondary btn-lg btn-block"
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connectorLogin({connector})}
          >
            {connector.name}
            {!connector.ready && ' (unsupported)'}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              ' (connecting)'}
          </button>
          
        ))}
        </div>
 
        {error && <div>{error.message}</div>}


    </>
  );
}

export const getServerSideProps = (async (context) => {
  const {login_challenge, message, signature} = context.query;

  try {
    const login_req = await hydraAdmin.getOAuth2LoginRequest({loginChallenge: login_challenge});
  }
  catch (error){
    console.log(error);
    return {props: {}};
  }

  return {props: {login_challenge}};  

});

export default SignIn;