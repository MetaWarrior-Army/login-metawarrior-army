// Hydra Admin connection
import { hydraAdmin } from '../src/hydra_config';
// NextJS Helpers
import  Head from "next/head";
// db connection
import conn from "../src/db.jsx";

// Consent is where we're adding the user to the database for some reason
// This should probably be changed
async function updateUser(address) {
  // Search the DB for the user
  var search;
  try {
    const query = 'SELECT * FROM users WHERE address=\''+address+'\'';
    const result = await conn.query(query);
    // Store results
    search = result;
  } catch ( error ) {
    console.log( error );
    return false;
  }

  // Do we have results? If so, return the user object
  if(search.rowCount > 0){
    // return user
    return search.rows[0];
  }
  // No results, create initial entry in DB
  else{
    const insert_q = 'INSERT INTO users (address,username) VALUES(\''+address+'\',NULL)';
    try{
      const insert_result = await conn.query(insert_q);
    }
    catch(error){
      console.log(error);
      return false;
    }
    // Now grab that DB entry we just created
    try{
      const search_q = 'SELECT * FROM users WHERE address=\''+address+'\'';
      const search_r = await conn.query(search_q);
      search = search_r;
    }
    catch(error){
      console.log(error);
      return false;
    }
    if(search.rowCount > 0){
      // Return user
      return search.rows[0];
    }
    else{
      //whoops
      console.log("Failed to find entry after insert.");
      return false;
    }
  }
}

// Consent App
function Consent({ consent_challenge, client_id, client_name, client_logo, requested_scope }) {
  // Set page title
  const page_title = "Authorize access to "+client_name;
  
  return (
    <>
    <Head>
      <title>{page_title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
    </Head>
      <form action={"/consent?consent_challenge="+consent_challenge} method="GET">
        <div className="form-group">
        <input type="hidden" name="consent_challenge" value={consent_challenge}></input>
        
        <div className="card text-bg-dark d-flex mx-auto" style={{width: 30+'rem'}}>
          <img className="rounded w-25 mx-auto" src={client_logo} alt="image cap" />
          <div className="card-body">
            <h5 className="card-title">Consent to Access</h5>
            <p className="card-text">Hi! <u>{client_name}</u> wants access to the following resources on your behalf.</p>

            {requested_scope.map((scope) => (
              <div key={scope.id}>
                <label key={scope.id} htmlFor={scope} id="label-{scope}" className="form-check-label p-3">
                  <input key={scope.id} type="checkbox" className="grant_scope form-check-input" id={scope} value={scope} name="grant_scope" defaultChecked={'checked'}/>
                  {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{scope}
                </label>
              </div>
            ))}

            <br></br>
            <br></br>

            <input type="submit" className="btn btn-outline-secondary btn-lg w-100" id="accept" name="submit" value="Allow access"></input>
            <input type="submit" className="btn btn-outline-secondary btn-lg w-100" id="reject" name="submit" value="Deny access"></input>
          </div>
        </div>

      </div>
      </form>   
      </> 
  );
}

export const getServerSideProps = (async (context) => {
  // Get Query
  const { consent_challenge, submit, grant_scope, remember } = context.query;
  // If grant scope isn't an array, make it one. 
  // We need an array for UI rendering
  if(!Array.isArray(grant_scope)){
    var grant_scopeArr = [grant_scope];
  }
  else{
    var grant_scopeArr = grant_scope;
  }
  
  // Get the Consent Request
  try {
    const consent_req = await hydraAdmin.getOAuth2ConsentRequest({consentChallenge: consent_challenge});
    // Check DB for user or create them
    const user = await updateUser(consent_req.data.subject);
    // Something went wrong, redirect user
    if(!user){
      return {
        redirect: {
          permanent: false,
          destination: "https://www.metawarrior.army"
        }
      }
    }
    
    //--------------------//
    //                    //
    //  BUILD AUTH TOKEN  //
    //--------------------//
    // Today we just take the user row from the DB and assign it to user
    const token_data = {
      access_token: {
        user: JSON.stringify(user),
        address: consent_req.data.subject,
        using: 'access_token',
      },
      id_token: {
        user: JSON.stringify(user),
        address: consent_req.data.subject,
        using: 'id_token',
      }
    };
    
    // Skip if already authorized
    if(consent_req.data.skip){
      // accept on OAuth server
      const accept_req = await hydraAdmin.acceptOAuth2ConsentRequest({
        consentChallenge: consent_challenge, 
        acceptOAuth2ConsentRequest: {
          grant_scope: consent_req.data.requested_scope,
          remember: true,
          remember_for: 3600,
          session: token_data,
        }
      });
      // redirect user back to client
      //console.log(accept_req.data.redirect_to);
      if(accept_req.data.redirect_to){
        return {
          redirect: {
            destination: accept_req.data.redirect_to,
            permanent: false,
          }
        };
      }
    }

    // is the user submiting a response?
    if(submit){
      // Is the user allowing access?
      if(submit == 'Allow access'){
        try{
          // accept on OAuth server
          const accept_req = await hydraAdmin.acceptOAuth2ConsentRequest({
            consentChallenge: consent_challenge, 
            acceptOAuth2ConsentRequest: {
              grant_scope: grant_scopeArr,
              remember: true,
              remember_for: 3600,
              session: token_data,
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
          // whoops
          console.log(error);
        }
      }
      // User denied access
      else if(submit == 'Deny access'){
        try{
          // reject
          const rej_req = await hydraAdmin.rejectOAuth2ConsentRequest({
            consentChallenge: consent_challenge,
          });
          // redirect user
          if(rej_req.data.redirect_to){
            return {
              redirect: {
                destination: rej_req.data.redirect_to,
                permanent: false,
              }
            };
          }
        }
        catch(error){
          // whoops
          console.log(error.message);
        }
      }
    }

    // User still needs to consent at this point
    // Set serverside props
    const client_id = consent_req.data.client.client_id;
    const client_name = consent_req.data.client.client_name;
    const client_logo = consent_req.data.client.logo_uri;
    const requested_scope = consent_req.data.requested_scope;
    // return props
    return {props: {consent_challenge, client_id, client_name, client_logo, requested_scope }}; 
  }
  catch (error){
    // whoops
    console.log(error);
    return {props: {consent_challenge}}; 
  }
});

export default Consent;