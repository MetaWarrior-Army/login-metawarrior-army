// Hydra OAuth2 Config
import { hydraAdmin } from '../src/hydra_config.ts';

function Logout({logout_challenge, redirect_to}) {
  // the user should never see this, we're currently redirecting in getServerSideProps()
  return (
  <div><h1>Logout</h1></div>
  );
}

export const getServerSideProps = (async (context) => {
  const {logout_challenge } = context.query;

  // get the logout request
  try {
    const logout_req = await hydraAdmin.getOAuth2LogoutRequest({logoutChallenge: logout_challenge});
    //console.log(logout_req);
  }
  catch (error){
    // Whoops
    console.log(error);
    return {props: {}};
  }

  // accept the logout request
  try {
    const accpt_req = await hydraAdmin.acceptOAuth2LogoutRequest({logoutChallenge: logout_challenge})
    if(accpt_req.data.redirect_to){
      return {
        redirect: {
          destination: accpt_req.data.redirect_to,
          permanent: false,
        }
      };
    }
  }
  catch(error){
    console.log(error);
    return {props: {}};
  }

});

export default Logout;

