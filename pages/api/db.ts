// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next';

import conn from "../../src/db.jsx";

type ResponseData = {
    message: string
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const { address } = req.body;

    //console.log(req);

    var search;
    try {
        const query = 'SELECT * FROM users WHERE address=\''+address+'\'';
        //const values = [req.body.content]
        const result = await conn.query(query);
        search = result;
        //console.log( result );
    } catch ( error ) {
        console.log( error );
    }

    
    if(search.rowCount > 0){
        //console.log("FOUND RESULT");
        res.status(200).json(search.rows[0]);
    }
    else{
        //console.log("NO RESULT");
        // Now we need to make the entry
        const insert_q = 'INSERT INTO users (address,username) VALUES(\''+address+'\',NULL)';
        try{
            const insert_result = await conn.query(insert_q);
        }
        catch(error){console.log(error);}
        
        //console.log(insert_result);
        //console.log(req);
        res.status(200).json({address: address});
    }
};
