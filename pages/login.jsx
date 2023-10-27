// Web3 helpers
import { useAccount, useConnect, useNetwork, useSwitchNetwork, useSignMessage, useDisconnect } from "wagmi";

// Moralis API
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";

// NextJS helpers
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
import  Head  from "next/head";

// Hydra OAuth2 Config
import { hydraAdmin } from '../src/hydra_config.ts';

// PROJECT CONFIG
import { project } from '../src/config.jsx';

// SignIn Page
function SignIn({ login_challenge, client, page_title, project_name, project_icon_url }) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork({ chainId: project.BLOCKCHAIN_NETWORK});
  const { disconnectAsync } = useDisconnect();
  const { isConnected, address } = useAccount({});
  const { signMessageAsync } = useSignMessage({
    onError(error) {
      const web3_error = document.getElementById('web3_error');
      web3_error.innerText = error.message;
    },
  });
  const { requestChallengeAsync } = useAuthRequestChallengeEvm();
  const { push } = useRouter();
  const { connectAsync, connectors, error, isLoading, pendingConnector } = useConnect({
    onError(error){
      const web3_error = document.getElementById('web3_error');
      web3_error.innerText = error.message;
    },
    onSuccess(data) {
        const web3_success = document.getElementById('web3_success');
        const web3_error = document.getElementById('web3_error');
        const connector_group = document.getElementById('connector_group');
        const loginDiv = document.getElementById('login');
        const disconnect = document.getElementById('disconnect');
        web3_success.innerText = "Wallet connected!";
        web3_error.innerText = "";
        connector_group.hidden = true;
        loginDiv.hidden = false;
        disconnect.hidden = false;

        try{
          if(chain.id != project.BLOCKCHAIN_NETWORK){
            switchNetwork(project.BLOCKCHAIN_NETWORK);
          }
        }
        catch(error){
          console.log(error);
        }
    }
  });

  // Connect to the user's wallet
  //
  //
  const connectWallet = async ({connector}) => {
    // if connected, disconnect
    if (isConnected) {
      await disconnectAsync();
    }
    // get account and chain data
    const {account, chain} = await connectAsync({connector: connector, chainId: project.BLOCKCHAIN_NETWORK});
    return true;
  }
  // Disconnect Wallet Button
  const disconnectWallet = async () => {
    await disconnectAsync();
    return true;
  }

  // Log the user in via Moralis
  //
  //
  const loginButton = async () => {
    // reset error msg
    const web3_error = document.getElementById('web3_error');
    web3_error.innerText = "";

    // Request a challenge message from Moralis
    const { message } = await requestChallengeAsync({
      address: address,
      chainId: chain.id,
    });

    // Request user sign message
    const signature = await signMessageAsync({ message });

    // Sign into moralis, get callback URL
    const options = {
      message,
      signature,
      redirect: false,
      callbackUrl: "/user", // We don't actually use this
      payload: JSON.stringify({login_challenge: login_challenge}),
    };

    // Send the sign-in payload to Moralis for verification
    const callback = await signIn("moralis-auth", options);
    
    // Forward user to consent or otherwise if we get a valid response
    if(callback){
      push(callback.url);
    }
    else {
      console.log("Failed to sign-in");
    }
    return true;
  }

  // UPDATE UI
  if(isConnected){
    try{
      const web3_success = document.getElementById('web3_success');
      const web3_error = document.getElementById('web3_error');
      const connector_group = document.getElementById('connector_group');
      const loginDiv = document.getElementById('login');
      const disconnect = document.getElementById('disconnect');
      web3_success.innerText = "Wallet connected!";
      connector_group.hidden = true;
      loginDiv.hidden = false;
      disconnect.hidden = false;
    }
    catch(error){
      //
    }
  }
  else{
    try{
      const web3_success = document.getElementById('web3_success');
      const loginDiv = document.getElementById('login');
      const disconnect = document.getElementById('disconnect');
      web3_success.innerText = "";
      connector_group.hidden = false;
      loginDiv.hidden = true;
      disconnect.hidden = true;
    }
    catch(error){
      //
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
    <Head>
      <title>{page_title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
      <link rel="icon" type="image/x-icon" href={project_icon_url}></link>
    </Head>
    <div className="card text-bg-dark d-flex mx-auto" style={{width: 30+'rem'}}>
      <img className="rounded w-25 mx-auto" src={client.logo_uri} alt="image cap"/>
      <div className="card-body">
        <h5 className="card-title"><u>Login to {project_name}</u></h5>
        <br></br>
        

        <div id="login" hidden>
          <p className="card-text">Login with address: <span className="text-info" id="address">{address}</span></p>
          <button onClick={() => loginButton()} type="button" className="btn btn-outline-secondary btn-lg w-100">Login</button>
        </div>

        <div id="connector_group">
          <h5>Connect your wallet</h5>
          {connectors.map((connector) => (
            // use this div to help us style the buttons
            <div className="w-100">
              
            <button type="button" className="btn btn-outline-secondary btn-lg w-100"
              disabled={!connector.ready}
              key={connector.id}
              onClick={() => connectWallet({connector})}
            >
              {connector.name}
              {!connector.ready && ' (unsupported)'}
              {isLoading &&
                connector.id === pendingConnector?.id &&
                ' (connecting)'}
            </button>
            
            </div>
          ))}
        </div>
        <br></br>
        <p className="small text-danger" id="web3_error">{error && error.message}</p>
        <p className="small text-success" id="web3_success"></p><p className="small" id="disconnect" hidden><a className="link-light" onClick={() => disconnectWallet()} href="#">Disconnect Wallet</a></p>

      </div>

      <h3><a href={"/login?login_challenge="+login_challenge+"&reject=true"} className="link-light">Back to {project_name}</a></h3>
      <br></br>

    </div>
    </>
  );
}

export const getServerSideProps = (async (context) => {
  const {login_challenge, message, signature, reject} = context.query;
  const page_title = "Login to "+process.env.PROJECT_NAME;
  const project_name = process.env.PROJECT_NAME;
  const project_icon_url = process.env.PROJECT_ICON_URL;

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

    // Skip login if remember == true
    if(login_req.data.skip){
      // Default accept with remember for 1 hour for seamless user experience logging into clients
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

      return {props: {login_challenge, client, page_title, project_name, project_icon_url}};
    }
    else{
      return {props: {login_challenge, client, page_title, project_name, project_icon_url }};
    }
    
  }
  catch (error){
    console.log(error);
    return {props: {}};
  }

});

export default SignIn;