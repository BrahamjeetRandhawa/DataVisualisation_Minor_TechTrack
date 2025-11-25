
    import * as topojson from 'topojson-client';
    import worldJson from 'world-atlas/countries-110m.json';


    export const mapDrawing = ({ svg, path }) => {

        // This fetches the country data out the json
        const countries = topojson.feature(worldJson, worldJson.objects.countries);

        // Drawing of the ocean on the globe (sphere)
        svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "sphere")
        .attr("d", path)
        .attr("fill", "#2B65EC")
        .attr("stroke", "black")
        .attr("stroke-width", 1)

        // Draws the countries on the globe (sphere)
        svg.selectAll(".country")
            .data(countries.features)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            // .attr("d", d3.geoPath())
            .attr("fill", "grey")
            .attr("stroke", "black")

    };