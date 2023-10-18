// Web3 helpers
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
// Moralis API
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";
// NextJS helpers
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
// Hydra OAuth2 Config
import { hydraAdmin } from '../src/hydra_config.ts';

// SignIn Page
function SignIn({ login_challenge, client }) {
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
    const callback = await signIn("moralis-auth", options);
    
    if(callback){
      push(callback.url);
    }
    else {
      console.log("Failed to sign-in");
    }
  }

  // This is a workaround for hydration errors caused by how we're displaying the 
  // connector options via connectors.map().
  // Essentially we just delay rendering slightly.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
		// This forces a rerender, so the value is rendered
		// the second time but not the first
		setHydrated(true);
	}, []);
	if (!hydrated) {
		// Returns null on first render, so the client and server match
		return null;
	}

  return (
    <>
    <div className="card text-bg-dark d-flex mx-auto" style={{width: 30+'rem'}}>
      <img className="rounded w-25 mx-auto" src={client.logo_uri} alt="image cap"/>
      <div className="card-body">
        <h5 className="card-title"><u>Wallet Login</u></h5>
        <p className="card-text">Login with your crypto wallet.</p>
        {connectors.map((connector) => (
          // use this div to help us style the buttons
          <div className="w-100">
            
          <button type="button" className="btn btn-outline-secondary btn-lg w-100"
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
           
          </div>
        ))}
        <br></br>
        <h3><a href={"/login?login_challenge="+login_challenge+"&reject=true"} className="link-light">Back to MetaWarrior Army</a></h3>
      </div>
      {error && <div>{error.message}</div>}
    </div>
    </>
  );
}

export const getServerSideProps = (async (context) => {
  const {login_challenge, message, signature, reject} = context.query;

  // return nothing if we don't get a good login_challenge
  try {
    const login_req = await hydraAdmin.getOAuth2LoginRequest({loginChallenge: login_challenge});
    const client = login_req.data.client;
    // First check for reject
    if(reject == 'true'){
      const rej_req = await hydraAdmin.rejectOAuth2LoginRequest({loginChallenge: login_challenge});
      console.log(rej_req);
      if(rej_req.data.redirect_to){
        return {
          redirect: {
            destination: rej_req.data.redirect_to,
            permanent: false,
          }
        };
      }
    }

    // Skip login if client is already logged in!
    if(login_req.data.skip){
      var accpt_req = await hydraAdmin.acceptOAuth2LoginRequest({loginChallenge: login_challenge, acceptOAuth2LoginRequest: {'subject': login_req.data.subject, remember: true, remember_for: 3600,}});
      if(accpt_req.data.redirect_to){
        return {
          redirect: {
            destination: accpt_req.data.redirect_to,
            permanent: false,
          }
        };
      }
      else{
        console.log("Undefined redirect post accept login request.");
      }


      return {props: {login_challenge, client}};
    }
    else{
      return {props: {login_challenge, client}};
    }
    
  }
  catch (error){
    console.log(error);
    return {props: {}};
  }

});

export default SignIn;