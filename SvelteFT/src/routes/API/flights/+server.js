

// require("dotenv").config();

import { json } from '@sveltejs/kit';

// const json = require("sveltejs/kit");


const Flight_URL = 'https://opensky-network.org/api/states/all';

export async function GET() {
    try {
    const response = await fetch(Flight_URL);

    if (!response.ok) {
        throw new Error(`OpenSky API error! status: ${response.status}`)
    }

    const data = await response.json();

    const flights = data.states;

    return json(flights);
    
} catch (error) {
    console.error('Failed to fetch data', error);
    return json({ error: "Failed to fetch data" }, { status: 500 });
}
}






// curl -H "Authorization: Bearer $TOKEN" https://opensky-network.org/api/states/all | jq .

// export TOKEN=${curl - x POST "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"} \
//     -H "Content-Type: application/x-www-form-urlencoded" \
//     -d "grant_type=client_credentials" \
//     -d "client_id=$CLIENT_ID" \
//     -d "client_secret=$CLIENT_SECRET" | jq -r .access_token)



