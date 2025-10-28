

// require("dotenv").config();

import { json } from '@sveltejs/kit';

// const json = require("sveltejs/kit");


const Flight_URL = 'https://opensky-network.org/api/states/all';

export async function GET() {
    const response = await fetch(Flight_URL);

    const data = await fetch(Flight_URL);

    return json(flights);
}

// curl -H "Authorization: Bearer $TOKEN" https://opensky-network.org/api/states/all | jq .

// export TOKEN=${curl - x POST "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"} \
//     -H "Content-Type: application/x-www-form-urlencoded" \
//     -d "grant_type=client_credentials" \
//     -d "client_id=$CLIENT_ID" \
//     -d "client_secret=$CLIENT_SECRET" | jq -r .access_token)
