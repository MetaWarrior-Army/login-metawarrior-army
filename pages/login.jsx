// Web3 helpers
import { useAccount, useConnect, useNetwork, useSwitchNetwork, useSignMessage, useDisconnect } from "wagmi";
// Moralis API
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";
// NextJS helpers
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
import  Head  from "next/head";
import Script from "next/script";
// Hydra OAuth2 Config
import { hydraAdmin } from '../src/hydra_config.ts';
// PROJECT CONFIG
import { project } from '../src/config.jsx';
// Axios for API query
import axios from 'axios';

// SignIn Page
function MWALogin({ login_challenge, client, page_title, project_name, project_icon_url }) {
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
    // This is used the first time a user connects their wallet
    onSuccess(data) {
        const web3_success = document.getElementById('web3_success');
        const web3_error = document.getElementById('web3_error');
        web3_success.innerText = "Wallet connected!";
        web3_error.innerText = "";
        jdenticon.update('#avatar',address);

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

    // Sign into moralis
    // We used to use the signin() callback in [...nextauth] because it's serverside, but that canceled out Next-Auth flow
    // So now we complete Next-Auth flow and use the auth protected api endpoint to acceptLogin
    const options = {
      message,
      signature,
      redirect: false,
      payload: JSON.stringify({login_challenge: login_challenge}),
    };

    // Send the sign-in payload to Moralis for verification
    const { url } = await signIn("moralis-auth", options);
    // If signin successful, accept login and redirect
    // url is just the login page we're currently at if signIn is successful
    if(url){
      const datam = {login_challenge: login_challenge};
      // API POST protected by Next-Auth session
      await axios.post('https://auth.metawarrior.army/api/acceptLogin', datam)
      .then((response) =>{
        console.log("API RESPONSE: ");
        console.log(response);
        if(response.data.redirect){
          push(response.data.redirect);
        }
      });
    }

    return true;
  }

  // Not sure if this is still needed
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
    <Script src="https://cdn.jsdelivr.net/npm/jdenticon@3.2.0/dist/jdenticon.min.js" integrity="sha384-yBhgDqxM50qJV5JPdayci8wCfooqvhFYbIKhv0hTtLvfeeyJMJCscRfFNKIxt43M" crossOrigin="anonymous"/>

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
        <div id="avatar_div">
          <svg width="80" id="avatar" height="80" data-jdenticon-value={address? address : ''}></svg>
        </div>
        <br></br>

        

        <div id="login" hidden={isConnected ? false : true}>
          <p className="card-text">Login with address: <span className="text-info" id="address">{address}</span></p>
          <button id="polygon" type="submit" 
            onClick={() => switchNetwork(project.BLOCKCHAIN_NETWORK)} 
            className="btn btn-outline-secondary btn-lg w-100" 
            hidden={
                chain ? 
                (chain.id != project.BLOCKCHAIN_NETWORK) ? false : true : true
            }>Connect to Polygon</button>
          <button onClick={() => loginButton()} type="button" 
            className="btn btn-outline-secondary btn-lg w-100"
            disabled={
              chain ?
              (chain.id != project.BLOCKCHAIN_NETWORK) ? true : false : false
            }>Login</button>
        </div>

        <div id="connector_group" hidden={isConnected ? true : false}>
          <h5>Connect your wallet</h5>
          {connectors.map((connector) => (
            // use this div to help us style the buttons
            <div className="w-100" key={connector.id}>
              
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
        <p className="small text-success" id="web3_success">
          {
            isConnected ? (
              <span>Wallet connected.</span>
            ) : false
          }
        </p>
        <p className="small" id="disconnect" hidden={isConnected ? false : true}>
          <a className="link-light" onClick={() => disconnectWallet()} href="#">Disconnect Wallet</a>
        </p>

      </div>

      <h3><a href={"/login?login_challenge="+login_challenge+"&reject=true"} className="link-light">Back to {project_name}</a></h3>
      <br></br>

    </div>
    </>
  );
}

//             //
// SERVER SIDE //
//             //
export const getServerSideProps = (async (context) => {
  // Begin setting the page properties
  const {login_challenge, message, signature, reject} = context.query;
  const page_title = "Login to "+process.env.PROJECT_NAME;
  const project_name = process.env.PROJECT_NAME;
  const project_icon_url = process.env.PROJECT_ICON_URL;

  // return nothing if we don't get a good login_challenge
  try {
    // Get Login Challenge
    const login_req = await hydraAdmin.getOAuth2LoginRequest({loginChallenge: login_challenge});
    // Acquire client
    const client = login_req.data.client;
    // First check for reject
    if(reject == 'true'){
      // Reject login challenge
      const rej_req = await hydraAdmin.rejectOAuth2LoginRequest({loginChallenge: login_challenge});
      // Redirect user after reject
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
    // Default accept with remember for 1 hour for seamless user experience logging into clients
    if(login_req.data.skip){
      // acceptLoginRequest
      var accpt_req = await hydraAdmin.acceptOAuth2LoginRequest({loginChallenge: login_challenge, acceptOAuth2LoginRequest: {'subject': login_req.data.subject, remember: true, remember_for: 3600,}});
      // Redirect user after accepting request
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
      // We're done, return props
      return {props: {login_challenge, client, page_title, project_name, project_icon_url}};
    }
    else{
      // Login challenge valid, user needs to login
      // return props
      return {props: {login_challenge, client, page_title, project_name, project_icon_url }};
    }
    
  }
  catch (error){
    // whoops
    console.log(error);
    return {props: {}};
  }

});

// export our Login app
export default MWALogin;