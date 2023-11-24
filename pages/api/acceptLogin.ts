// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next';
// Hydra OAuth Config
import { hydraAdmin } from '../../src/hydra_config';
//Next Auth Server Session
import { getServerSession } from "next-auth";
// Auth Config for getting server session
import { authOptions } from "./auth/[...nextauth]";

// This is our API Response type
type ResponseData = {
    redirect: string
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // Get Server Session (Next-Auth)
    const session = await getServerSession(req,res,authOptions);
    
    // If valid sesson proceed
    if(session.user){
        // Get the subject from the request
        const { login_challenge, address } = req.body;

        // Try accepting login with Hydra
        // Subject is the user's address
        try {
            // Accept Login
            //console.log(session.user.address);
            var accpt_res = await hydraAdmin.acceptOAuth2LoginRequest({loginChallenge: login_challenge, 
              acceptOAuth2LoginRequest: {
                subject: session.user.address, 
                remember: true, 
                remember_for: 3600,
              }
            });
        }
        catch (error) {
            // Whoops
            console.log(error.message);
            console.log("Subject: ", session.user.address);
        }

        //console.log(accpt_res.data.redirect_to);
        // Redirect user to next step in flow, provide redirect url from Hydra
        res.status(200).json({redirect:  accpt_res.data.redirect_to});
        return;
    }
    else{
        // Invalid session, unathorized technically, but obfuscation good. 
        res.status(500);
        return;
    }
};