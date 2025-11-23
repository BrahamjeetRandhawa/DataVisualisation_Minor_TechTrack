

// require("dotenv").config();

import { json } from '@sveltejs/kit';

// const json = require("sveltejs/kit");



const Flight_URL = 'https://opensky-network.org/api/states/all';

const Flight_URL_2 = ''
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


