

import * as d3 from 'd3';

// The visibleThreshold keeps the planes from rendering behind the globe. the pi / 2 = 1/2pi. This also equals to 90 degrees, because 2pi is 360 degrees. Th globe has 2 parts with 90 degree radius, which means, everything above it should be hidden and not rendered.
const visibleThreshold = Math.PI / 2;

export const updateFlightsPosition = ({ svg, projection, flightData, hoveredFlight, currentSize }) => {
        if (!svg || !projection || flightData.length === 0) return;

        // Here the center of the globe van be found by not rotating the globe. Because the globe begins in Norwich England, which is the center for [long, lat] coordinates.
        const center =[-projection.rotate()[0], -projection.rotate()[1]];
        // const iconSize = 25;

        // ------Aircraft icons------
        svg.selectAll("image.flight")
        .style("display", d => {
            const dist = d3.geoDistance(d.coords, center);
            return dist > visibleThreshold ? "none" : "block";
        })

        // Here the width and height of the aircraft are determind by the hover state. If the hover is applied to the aircraft, the size will increase to 50 and otherwise it will stay 25. With this the UI get better to understand, and the clickables on the screen is also better understandable.
        .attr("width", d => {
            return (hoveredFlight && d.id === hoveredFlight.id) ? 50 : 25;
        })
        .attr("height", d => {
            return (hoveredFlight && d.id === hoveredFlight.id) ? 50 : 25;
        })
        .attr("transform", d => {
            const p = projection(d.coords);
            if (!p) return null;

            currentSize = (hoveredFlight && d.id === hoveredFlight.id) ? 50 : 25;

            const x = p[0] - (currentSize / 2);
            const y = p[1] - (currentSize / 2);
            return `translate(${x}, ${y}) rotate(${d.heading}, ${(currentSize / 2)}, ${(currentSize / 2)})`;
        })

        .classed("highlighted", d => hoveredFlight && d.id === hoveredFlight.id)
    }