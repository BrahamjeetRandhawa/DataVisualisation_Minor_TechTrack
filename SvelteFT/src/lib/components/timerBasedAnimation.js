
    import * as d3 from 'd3';

    let hasMoved = false;
    const speedFactor = 0.0000005;

    export let timer;

    export const flightAnimation = ({ flightData, updateFlights }) => {

        // With the timer function I create a flightpath animation for the aircrafts in between the real API fetch. I have done this, because the API cannot be fetched every couple of second, the API has a token limit.
        timer = d3.timer((elapsed => {

            if (!flightData || flightData.length === 0) return;

            flightData.forEach(d => {
                if(d.velocity && d.velocity > 0) {

                    // Here the heading will be calculated by using the heading and to multiply it by PI. This will then be divided by 180 to transform it into radials. Here radials is better to use, because of the cos and sin calculation after.
                    const rad = (d.heading * Math.PI) /180;

                    // In order to calculate the lat and lon. I have used cos and sin for it. cos and sin can be calculated with a triangle. The distance from the lat and long is 2 parts of a triangle. If I want to know the heading, I should calculate the vector then. Which  is the same as putting the latitude length after the latitude path. If doing so for both, there will come one point which then is the initial vector of the airplane. 
                    const dLat = Math.cos(rad) * d.velocity * speedFactor;
                    const dLon = Math.sin(rad) * d.velocity * speedFactor;


                    // The data for the long and lat will be fetched from here.
                    d.coords[0] += dLon;
                    d.coords[1] += dLat;
                    hasMoved = true;
                }
            });
            if(hasMoved)
            updateFlights();
        }))

        return timer;
    }