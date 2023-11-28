// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next';
// db connection
import conn from "../../src/db.jsx";
// Hydra OAuth Config
import { hydraAdmin } from '../../src/hydra_config';

type ResponseData = {
    message: string
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {

    const { address } = req.body;
    console.log(req);

    if(address){
        //console.log(address);
    }
    else{
        res.status(500).json({message: ''});
        return;
    }

    const authorization_header = req.headers['authorization'];
    const access_token = authorization_header.split(" ")[1];
    //console.log(access_token);
    const token_resp = await hydraAdmin.introspectOAuth2Token({token: access_token});
    //console.log(token_resp);
    if(token_resp.data.active){
        //console.log(token_resp.data.sub+" is active");

        // Search the DB for the user
        var search;
        try {
            const query = 'SELECT * FROM users WHERE address=\''+address+'\'';
            const result = await conn.query(query);
            // Store results
            search = result;
        } catch ( error ) {
            console.log( error );
            res.status(500).json({message: 'error'});
            return;
        }

        // Do we have results? If so, return the user object
        if(search.rowCount > 0){
            //console.log("FOUND RESULT");
            res.status(200).json(search.rows[0]);
            return;
        }
        // No results, create initial entry in DB
    }


    

    res.status(200).json({message: 'TESTING'});
    return;
};