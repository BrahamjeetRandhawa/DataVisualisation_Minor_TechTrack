
import { json } from '@sveltejs/kit';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

const Flight_URL = 'https://opensky-network.org/api/states/all';
const Auth_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

// ------Written by AI------

function getMockData() {
    const mockFlights = [];
    const airlines = ['KLM', 'TRA', 'EZY', 'DLH', 'BAW', 'AFR', 'RYR'];
    const count = 300; // Number of fake flights

    for (let i = 0; i < count; i++) {
        // Random coordinates in Europe
        // Lat: 45-55, Lon: 0-15
        const lat = 48 + (Math.random() * 10) - 2; 
        const lon = 4 + (Math.random() * 15) - 5; 
        const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
        const callsign = `${randomAirline}${Math.floor(Math.random() * 999)}`.padEnd(8, ' ');
        const altitude = Math.floor(Math.random() * 12000);
        const velocity = 100 + Math.random() * 200;
        const track = Math.random() * 360;

        // OpenSky State Vector Format
        mockFlights.push([
            "a" + Math.floor(Math.random() * 100000), // 0: icao24 (fake id)
            callsign,                                 // 1: callsign
            "Mock Country",                           // 2: origin_country
            Math.floor(Date.now() / 1000),            // 3: time_position
            Math.floor(Date.now() / 1000),            // 4: last_contact
            lon,                                      // 5: longitude
            lat,                                      // 6: latitude
            altitude,                                 // 7: baro_altitude
            false,                                    // 8: on_ground
            velocity,                                 // 9: velocity
            track,                                    // 10: true_track
            0,                                        // 11: vertical_rate
            null,                                     // 12: sensors
            altitude,                                 // 13: geo_altitude
            null,                                     // 14: squawk
            false,                                    // 15: spi
            0                                         // 16: position_source
        ]);
    }
    
    // To always have a flight above Netherlands
    mockFlights.push(["484161", "KLM999  ", "Netherlands", 1683724020, 1683724020, 4.764, 52.308, 1500, false, 140, 90, 0, null, 1500, null, false, 0]);

    return mockFlights;
}




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
    const mockFlights = getMockData();
    return json(mockFlights);
}
}


