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
    // Get the subject from the request
    const { address } = req.body;

    // Search the DB for the user
    var search;
    try {
        const query = 'SELECT * FROM users WHERE address=\''+address+'\'';
        const result = await conn.query(query);
        // Store results
        search = result;
    } catch ( error ) {
        console.log( error );
        res.status(500).json({message: error});
    }

    // Do we have results? If so, return the user object
    if(search.rowCount > 0){
        //console.log("FOUND RESULT");
        res.status(200).json(search.rows[0]);
    }
    // No results, create initial entry in DB
    else{
        const insert_q = 'INSERT INTO users (address,username) VALUES(\''+address+'\',NULL)';
        try{
            const insert_result = await conn.query(insert_q);
        }
        catch(error){
            console.log(error);
            res.status(500).json({message: error});
            return;
        }
        
        res.status(200).json({address: address});
    }
};