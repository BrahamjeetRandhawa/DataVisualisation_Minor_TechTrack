
import { json } from '@sveltejs/kit';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

const Flight_URL = 'https://opensky-network.org/api/states/all';
const Auth_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

// ------Written by AI------
let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
    const now = Date.now();

    // Return cached token if it's still valid (buffer of 60 seconds)
    if (cachedToken && now < tokenExpiry - 60000) {
        return cachedToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const response = await fetch(Auth_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    if (!response.ok) {
        throw new Error(`Failed to get OpenSky token! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the token
    cachedToken = data.access_token;
    // data.expires_in is in seconds, convert to milliseconds
    tokenExpiry = now + (data.expires_in * 1000);

    return cachedToken;
}

// ------End of AI writing------

export async function GET() {

    console.log('Server is starting. Auth is working?', CLIENT_ID ? "YES" : "NO");
    try {
        const token = await getAccessToken();
        const response = await fetch(Flight_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                // The server.js will try to fetch the data from the api for 5 seconds if longer, it will disconnect on its own and show fallback message
            },
            signal: AbortSignal.timeout(5000)
        });

    if (!response.ok) {
        throw new Error(`OpenSky API error! status: ${response.status}`)
    }

    const data = await response.json();

    const flights = data.states;

    return json(flights);
    
} catch (error) {
    console.error('Failed to fetch data', error);
    return json([]);
}
}


