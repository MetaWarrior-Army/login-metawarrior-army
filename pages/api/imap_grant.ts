import type { NextApiRequest, NextApiResponse } from 'next';
// db connection
import conn2 from "../../src/db2.jsx";

/*
type ResponseData = {
    message: string
};
*/

export default async function handler(
    req: NextApiRequest,
    //res: NextApiResponse<ResponseData>
    res: NextApiResponse
) {
    // get query
    const { access_token } = req.query;
    // secure memory
    var userObj;

    if(!access_token){
        res.status(500);
        return;
    }
    //console.log(access_token);

    const datam = { token: access_token };
    await fetch('https://auth.metawarrior.army/userinfo', {
        method: 'POST',
        headers: { 'Content-type': 'application/json',
                    'Authorization':'Bearer '+access_token},
        body: JSON.stringify(datam),
    })
    .then((response) => response.json())
    .then((data) => {
        // save response
        userObj = data;
    })
    .catch((error) => {
        console.log(error);
    });
    

    // Example respons
    /*
    {
        address: '-',
        aud: [ '-' ],
        auth_time: 1701149213,
        email: '-@metawarrior.army',
        iat: 1701149296,
        iss: 'https://auth.metawarrior.army',
        rat: 1701149295,
        sub: '-',
        userObj: '-',
        username: '-',
        using: 'id_token'
    }
    */      

    //console.log(userObj);
    
    if(userObj.email){
        // lookup user in the postfix database to get quota rules
        const userq = "SELECT * FROM mailbox WHERE username='"+userObj.email+"'"
        const userq_resp = await conn2.query(userq);
        // Format quota rules
        const quotabytes = Number(userq_resp.rows[0].quota);
        //console.log(quotabytes);
        const quotam = quotabytes / 1000000;
        // Dovecot Imap format for quota
        const quota_rule = "dirsize:storage=+"+String(quotam)+"M";

        // Rebuild return object for Dovecot IMAP
        const returnObj = {
            auth_time: userObj.auth_time,
            email: userObj.email,
            iat: userObj.iat,
            iss: userObj.iss,
            rat: userObj.rat,
            sub: userObj.sub,
            username: userObj.username,
            using: userObj.using,
            quota_rule: quota_rule,
            active: true
        };

        // return
        res.status(200).json(returnObj);
        return;
    }
    else{
        res.status(500);
        return;
    }
    

    res.status(500);
    return;
    
}