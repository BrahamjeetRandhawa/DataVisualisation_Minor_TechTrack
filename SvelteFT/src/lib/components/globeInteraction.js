
import * as d3 from 'd3';

export const interactions = ({ svg, projection, path, initialScale, updateFlights, onUserInteraction }) => {

    // I am using sensitivity here, because sensitivt is being used active here
    let sensitivity = 0.25;

const drag = d3.drag()
        .on("start", (event) => {
            if (onUserInteraction) onUserInteraction();
            event.subject.rotate = projection.rotate()
        })

        .on("drag", (event) => {
            if (onUserInteraction) onUserInteraction();
            // const sensitivity = 0.25
            const currentRotate = projection.rotate()
            // const rotate = event.subject.rotate
            const k = sensitivity
        
        projection.rotate([
            currentRotate[0] + event.dx * k,
            currentRotate[1] - event.dy * k,
            currentRotate[2]
        ]);

        path = d3.geoPath(projection)

        svg.selectAll("path")
        .attr("d", path)
        
        // Update the aircrafts linked to the main updateFlight
        if (updateFlights) updateFlights();
        })

        const zoom = d3.zoom()
        .scaleExtent([0.5, 30])

        // Here I filter between the zoom types. In order to stop the conflict
        .filter((event) => {
            if (event.type === 'wheel') return true;

            if (event.type && event.touches.length >= 2) return true;

            return false;
        })
        .on("zoom", event => {
            if (onUserInteraction) onUserInteraction();
            const newScale = initialScale * event.transform.k;

            projection.scale(newScale);

            path = d3.geoPath(projection)
            svg.selectAll("path")
            .attr("d", path);

        // The if statements here gives the drag sensitivity for each zoom level. Without these if statements, the drag would become to sensitive in a zoomed level.
        if (event.transform.k > 20) {
            sensitivity = 0.01;
        } else if (event.transform.k > 15) {
            sensitivity = 0.05
        } else if (event.transform.k > 10) {
            sensitivity = 0.10;
        } else if (event.transform.k > 5) {
            sensitivity = 0.20;
        } else if (event.transform.k < 5) {
            sensitivity = 0.25;
        }

        // Update the aircrafts linked to the main updateFlight
        if (updateFlights) updateFlights();
        });
        
        // Here I call the drag and zoom function to enable the zoom and drag on the globe
        svg
        .call(drag)
        .call(zoom);

    };