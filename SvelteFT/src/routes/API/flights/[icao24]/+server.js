

import { json } from '@sveltejs/kit'
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private'


const MOCK_AIRPORTS = [
    'EHAM', // Schiphol
    'EGLL', // Heathrow
    'LFPG', // Charles de Gaulle
    'EDDF', // Frankfurt
    'KJFK', // JFK New York
    'OMDB', // Dubai
    'WSSS', // Singapore
    'EBBR', // Brussel
    'LEMD'  // Madrid
];

function getMockRoute(icao24) {
    // We gebruiken de icao24 code om "random" te kiezen, maar wel consistent
    // zodat als je de pagina herlaadt, hetzelfde vliegtuig dezelfde route houdt (optioneel).
    // Of gewoon volledig random:
    const depIndex = Math.floor(Math.random() * MOCK_AIRPORTS.length);
    let arrIndex = Math.floor(Math.random() * MOCK_AIRPORTS.length);
    
    // Zorg dat vertrek en aankomst niet hetzelfde zijn
    if (arrIndex === depIndex) {
        arrIndex = (arrIndex + 1) % MOCK_AIRPORTS.length;
    }

    return {
        estDepartureAirport: MOCK_AIRPORTS[depIndex],
        estArrivalAirport: MOCK_AIRPORTS[arrIndex]
    };
}

export const GET = async ({ params, fetch}) => {
    const { icao24 } = params;


const end = Math.floor(Date.now() / 1000);
const begin = end - 86400;

const flightStatUrl = `https://opensky-network.org/api/flights/aircraft?icao24=${icao24}&begin=${begin}&end=${end}`;

try {

    const tokenResponse = await fetch("https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },

    body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    })
});


    // console.log(`${icao24}`)
    // console.log(`${CLIENT_ID}`)
    // const header = new Headers();
    // header.set('Authorization', 'Basic ' + btoa(CLIENT_ID + ":" + CLIENT_SECRET))

    // const response = await fetch(flightStatUrl, { headers: header });

    if (!tokenResponse.ok) {
        console.log(`API Error: ${tokenResponse.status}`)
        return json({ estArrivalAirport: null, estDepartureAirport: null});
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('authentication is working')

    const flightResponse = await fetch(flightStatUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    if (!flightResponse.ok) {
        console.log('Flight api not working')
        return json({ estArrivalAirport: null, estDepartureAirport: null});
    }

    const data = await flightResponse.json()
    
    if (data && data.length > 0) {

        data.sort((a, b) => b.firstSeen - a.firstSeen);
        const currentFlight = data[0];
        // return json(data[0]);

        return json({
        estArrivalAirport: currentFlight.estArrivalAirport || 'Unknown',
        estDepartureAirport: currentFlight.estDepartureAirport || 'Unknown'
     });
    }
    return json({
        estArrivalAirport: null,
        estDepartureAirport: null
    });

    
} catch (error) {
    console.error('Error fetching flight stats:', error);
    const mockRoute = getMockRoute(icao24)
    return json(mockRoute);
}
}