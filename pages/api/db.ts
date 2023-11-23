// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next';
// db connection
import conn from "../../src/db.jsx";
//Next Auth Server Session
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

type ResponseData = {
    message: string
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const session = await getServerSession(req,res,authOptions);
    
    //if(session.user){
    
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
            return;
        }

        // Do we have results? If so, return the user object
        if(search.rowCount > 0){
            //console.log("FOUND RESULT");
            res.status(200).json(search.rows[0]);
            return;
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

            // Now grab that DB entry
            try{
                const search_q = 'SELECT * FROM users WHERE address=\''+address+'\'';
                const search_r = await conn.query(search_q);
                search = search_r;
            }
            catch(error){
                console.log(error);
                res.status(500).json({message: error});
                return;
            }
            if(search.rowCount > 0){
                res.status(200).json(search.rows[0]);
                return;
            }
            else{
                console.log("Failed to find entry after insert.");
                res.status(500).json({message: 'Failed to find entry after insert.'});
                return;
            }
            
        }
    //}
};
