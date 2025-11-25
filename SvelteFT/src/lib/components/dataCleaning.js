
export const cleanFlightData = (rawFlights) => {

    return rawFlights
    .filter(flight => flight[5] != null && flight[6] != null)
    .map(flight => ({
        coords: [flight[5], flight[6]],
        heading: flight[10] || 0,
        velocity: flight[9] || 0,
        callSign: flight[1] || "N/A",
        origin_country: flight[2] || "N/A",
        id: flight[0],
        longitude: flight[5],
        latitude: flight[6],
        vertical_rate: flight[11],
        geo_altitude: flight[13],
        // The ? ... : ... is called the 'ternary operator'. This operator gives certain operations by boolean. When the boolean is true, it will return the string before the ':' and false is the string after ':'.
        on_ground: flight[8] ? "aircraft has landed" : "Aircraft is in the air"
        // Here I extract the data that I need for my globe. For instance the coordinates is needed to determine the position of the airplanes on the globe. The [long, lat] can also be shown on screen to the user to let the user further undeerstand the position of the aircraft.
    }))
}