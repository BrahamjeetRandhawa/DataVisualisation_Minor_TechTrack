

import { json } from '@sveltejs/kit'

export const GET = async ({ params, fetch}) => {
    const { icao24 } = params;


const end = Math.floor(Date.now() / 1000);
const begin = end - 86400;

const flightStatUrl = 'https://opensky-network.org/api/flights/aircraft?icao24=${icao24}&begin=${begin}&end=${end}';

try {
    const response = await fetch(flightStatUrl);

    if (!response.ok) {
        return json({ estArrivalAirport: null});
    }

    const data = await response.json();

    if (data && data.length > 0) {

        data.sort((a, b) => b.firstSeen - a.firstSeen);
        const currentFlight = data[0];
        // return json(data[0]);
    }

    return json({
        estArrivalAirport: currentFlight.estArrivalAirport,
        estDepartureAirport: currentFlight.estDepartureAirport
     });
} catch (error) {
    console.error('Error fetching flight stats:', error);
    return json({ error: 'Failed to fetch the details'}, { status: 500 });
}
}