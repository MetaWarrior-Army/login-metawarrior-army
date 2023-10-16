import { hydraAdmin } from '../src/hydra_config.ts';

function Consent({ consent_challenge, client_id, client_name, requested_scope }) {
  
  return (
    <>
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
    </>
  );
}

export const getServerSideProps = (async (context) => {
  // get query
  var { consent_challenge, submit, grant_scope, remember } = context.query;
  var props;

  // If grant scope isn't an array, make it one
  if(!Array.isArray(grant_scope)){
    grant_scope = [grant_scope];
  }

  // is the user submiting a response?
  if(submit){
    var session = {
      access_token: {
        username: 'test',
        usersecret: 'test_secret'
      },
      id_token: {
        username: 'test'
      }
    };

    // Is the user allowing access?
    if(submit == 'Allow access'){
      try{
        // accept on OAuth server
        var accept_req = await hydraAdmin.acceptOAuth2ConsentRequest({
          consentChallenge: consent_challenge, 
          acceptOAuth2ConsentRequest: {
            grant_scope: grant_scope,
            session: session,
          }
        });
      }
      catch(error){
        console.log(error);
      }

      // redirect user back to client
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

  // Get the Consent Request
  try {
    var consent_req = await hydraAdmin.getOAuth2ConsentRequest({consentChallenge: consent_challenge});

    // Set serverside props
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