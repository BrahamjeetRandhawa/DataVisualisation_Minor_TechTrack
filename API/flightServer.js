

require("dotenv").config();

const json = require("sveltejs/kit");


const Flight_URL = 'https://opensky-network.org/api/states/all';

curl -H "Authorization: Bearer $TOKEN" https://opensky-network.org/api/states/all | jq .

export TOKEN=${curl - x POST "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"} \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=client_credentials" \
    -d "client_id=$CLIENT_ID" \
    -d "client_secret=$CLIENT_SECRET" | jq -r .access_token)
