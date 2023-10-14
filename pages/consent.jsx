'use server'
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { getSession, signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/router";
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";
const circJSON = require('circular-json');

import { hydraAdmin } from '../src/hydra_config.ts';

function Consent({ consent_challenge, client_id, client_name, requested_scope }) {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { requestChallengeAsync } = useAuthRequestChallengeEvm();
  const { push } = useRouter();
  
  console.log("CONSENT CHALLENGE");
  console.log({consent_challenge});

  console.log("CONSENT REQUEST");
  console.log("CLIENT ID: "+client_id);
  console.log("CLIENT NAME: "+client_name);
  console.log("REQUESTED SCOPE: "+requested_scope);
  
  
  const handleConsent = async () => {

  };
  

  return (
    <div>
      <h3>Consent</h3>
      <form action={"/consent?consent_challenge="+consent_challenge} method="GET">
        <input type="hidden" name="consent_challenge" value={consent_challenge}></input>
        <p>Hi! {client_name} wants access to resources on your behalf.</p>

        {requested_scope.map(scope => (
          <label htmlFor={scope} id="label-{scope}">
            <input type="checkbox" className="grant_scope" id={scope} value={scope} name="grant_scope"></input>
            {scope}
          </label>
        ))}


          <br></br>
          
          <label htmlFor="remember">
            <input type="checkbox" id="remember" name="remember" value="1"></input>
            Don't ask me again
          </label>
          
          <br></br>

          <input type="submit" id="accept" name="submit" value="Allow access"></input>
          <input type="submit" id="reject" name="submit" value="Deny access"></input>

      </form>


    </div>
  );
}

export const getServerSideProps = (async (context) => {
  console.log(context.req.method);
  //console.log(context.query);
  var { consent_challenge, submit, grant_scope, remember } = context.query;
  console.log(context.query);
  var props;

  const fs = require('fs');

  if(!Array.isArray(grant_scope)){
    grant_scope = [grant_scope];
  }

  if(submit){
    if(submit == 'Allow access'){
      console.log("ALLOW ACCESS");
      try{
        var accept_req = await hydraAdmin.acceptOAuth2ConsentRequest({consentChallenge: consent_challenge, acceptOAuth2ConsentRequest: {grant_scope: grant_scope,}});
        console.log(accept_req);
      }
      catch(error){
        console.log(error);
      }

      if(accept_req.data.redirect_to){
        return {
          redirect: {
            destination: accept_req.data.redirect_to,
            permanent: false,
          }
        };

      }
      
    }
  }

  try {
    var consent_req = await hydraAdmin.getOAuth2ConsentRequest({consentChallenge: consent_challenge});

    //console.log(consent_req.data);
    //console.log("^^CONSENT REQUEST^^");
    var client_id = consent_req.data.client.client_id;
    var client_name = consent_req.data.client.client_name;
    var requested_scope = consent_req.data.requested_scope;
    var props = {consent_challenge, client_id, client_name, requested_scope};
  }
  catch (error){
    console.log(error);
    var props = {consent_challenge};
  }


  return {props: props};  

});

export default Consent;