// Hydra Admin connection
import { hydraAdmin } from '../src/hydra_config.ts';

function Consent({ consent_challenge, client_id, client_name, requested_scope }) {
  
  return (
      <form action={"/consent?consent_challenge="+consent_challenge} method="GET">
        <div className="form-group">
        <input type="hidden" name="consent_challenge" value={consent_challenge}></input>
        
        <div className="card text-bg-dark d-flex mx-auto" style={{width: 18+'rem'}}>
          <img className="card-img-top" src="/" alt="image cap" />
          <div className="card-body">
            <h5 className="card-title">Consent to Access</h5>
            <p className="card-text">Hi <u>{client_name}</u> wants access to the following resources on your behalf.</p>

            {requested_scope.map(scope => (
              <div>
              <label htmlFor={scope} id="label-{scope}" className="form-check-label p-2">
                <input type="checkbox" className="grant_scope form-check-input" id={scope} value={scope} name="grant_scope"></input>
                {scope}
              </label>
              </div>
            ))}


            <br></br>
            
            <label htmlFor="remember" className="form-check-label p-3">
              <input type="checkbox" className="form-check-input" id="remember" name="remember" value="1" disabled></input>
              Don't ask me again
            </label>
            
            <br></br>

            <input type="submit" className="btn btn-outline-secondary btn-lg w-100" id="accept" name="submit" value="Allow access"></input>
            <input type="submit" className="btn btn-outline-secondary btn-lg w-100" id="reject" name="submit" value="Deny access"></input>
          </div>
        </div>

      </div>
      </form>    
  );
}

export const getServerSideProps = (async (context) => {
  // get query
  const { consent_challenge, submit, grant_scope, remember } = context.query;

  // If grant scope isn't an array, make it one
  if(!Array.isArray(grant_scope)){
    var grant_scopeArr = [grant_scope];
  }
  else{
    var grant_scopeArr = grant_scope;
  }
  
  // is the user submiting a response?
  if(submit){
    const session = {
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
        const accept_req = await hydraAdmin.acceptOAuth2ConsentRequest({
          consentChallenge: consent_challenge, 
          acceptOAuth2ConsentRequest: {
            grant_scope: grant_scopeArr,
            session: session,
          }
        });
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
      catch(error){
        console.log(error);
      }
    }

  }

  // Get the Consent Request
  try {
    const consent_req = await hydraAdmin.getOAuth2ConsentRequest({consentChallenge: consent_challenge});

    // Set serverside props
    const client_id = consent_req.data.client.client_id;
    const client_name = consent_req.data.client.client_name;
    const requested_scope = consent_req.data.requested_scope;
    return {props: {consent_challenge, client_id, client_name, requested_scope }}; 
  }
  catch (error){
    console.log(error);
    return {props: {consent_challenge}}; 
  }

});

export default Consent;