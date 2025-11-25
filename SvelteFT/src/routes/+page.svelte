
<!-- ------Flight Tracker------ -->
<script >
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import FlightCard from '$lib/components/flightCard.svelte';
    import TooltipSetup from '$lib/components/tooltipSetup.svelte';
    import { cleanFlightData } from '$lib/components/dataCleaning';
    import { interactions } from '$lib/components/globeInteraction';
    import { mapDrawing } from '$lib/components/mapDrawing';
    import { updateFlightsPosition } from '$lib/components/flightUpdates'
    import { fetchData, fetchFlightDetails } from '$lib/components/APIService';

    import { fade, scale, crossfade } from 'svelte/transition';
    import { cubicOut, quintOut } from 'svelte/easing'

    import { onMount } from 'svelte'

    // ------Global variables------

    // The variables will be placed outside the scope. The variables cannot be used for other functions if used in one function.
    let width;
    let height;

    // dataHandling for the aircrafts
    let allFlights = [];
    let flightData = [];
    let svgContainer;

    // globe and features variables
    let projection;
    let path;
    let svg;
    let initialScale;
    let currentZoom;
    let intervalID;
    let hasMoved = false;
    let timer;
    const speedFactor = 0.0000005;

    // For hover effect on aircrafts
    let hoveredFlight = null;
    let mouseX = 0;
    let mouseY = 0;

    // For flight stats on card
    let selectedFlight = null;

    // Aircraft sizes
    let iconSize = 25;
    let currentSize;

    const [send, receive] = crossfade({
        duration: 500,
        easing: cubicOut,

        fallback(node, params) {
            return {
                duration: 200,
                easing: cubicOut
            };
        }
    })

    // This block changes according to the change of the width and height of the screen
    $: if (svg && projection && width && height) {
        // Update svg container dimensions
        svg
        .attr("width", width)
        .attr("height", height);

        // Update projection to the middle of the screen
        projection
        .translate([width / 2, height / 2]);

        // Update the path on the new globe size
        path = d3.geoPath(projection);

        // Redraw th new sphere using the new path
        svg.select(".sphere")
        .attr("d", path);

        // Update all country's using the new path
        svg.selectAll(".country")
        .attr("d", path);

        // Apply the update and reposition everything
        updateFlights();
    }

    // Apply changes on SVG, projection, flightData, hoveredFlight
    const updateFlights = () => {
        updateFlightsPosition({
            svg: svg,
            projection: projection,
            flightData: flightData,
            hoveredFlight: hoveredFlight
        });
    };

    // ------Data cleaning for aircrafts------
    const drawFlightsOnGlobe = (flights) => {

        flightData = cleanFlightData(flights);
        
        svg.selectAll("image.flight")
        .data(flightData, d => d.id)
        .join(enter => enter.append("image")
            .attr("class", "flight")

            // Aircraft icon
            .attr("href", "/flight-plane-svgrepo-com.svg")

            // Here the airplanes size is determined at start
            .attr("width", currentSize)
            .attr("height", currentSize)

            .on("click", async (event, d) => {
                // This prevents the drag and click issue on the screen. 
                event.stopPropagation();

                // This is the state of the flights
                selectedFlight = {...d, estArrivalAirport: 'Loading...'};

                // the '...' means loading state
                const details = await fetchFlightDetails(d.id);
                selectedFlight = { ...selectedFlight, ...details };

                console.log("Flight selected:", d); 
            })

            // Event listeners for when the mouse enters the aircraft icon
            .on("mouseover", (event, d) => {
                // Store the flight data to trigger the Svelte tooltip component
                hoveredFlight = d;
                // Get mouse coordinates to position the tooltip div element
                mouseX = event.pageX;
                mouseY = event.pageY;

                // Select the current component and move it to the top of the SVG, which will get the tooltip above the globe
                hoveredFlight = d;
                d3.select(event.currentTarget)
                .raise();
            })

            // This updates coordinates while moving the mouse within the icon, which ensures the tooltip will follow the mouse cursor
            .on("mousemove", (event) => {
                mouseX = event.pageX;
                mouseY = event.pageY;
            })

            // When the mousee leaves the aircraft icon
            .on("mouseout", (event, d) => {

                // If the flight is clicked or selected, do not clear the hover state. Which keeps the aircraft highlighted
                if (selectedFlight && selectedFlight.id === d.id) {
                    return;
                }
                // Clear the hover state to hide the tooltip
                hoveredFlight = null;

                updateFlights();
            }),
            // Keeps existing elements unchanged
            update => update,
            // Removes aircrafts that are no longer selected from the data array
            exit => exit.remove()
        )
        updateFlights();
    }

    $: if (allFlights.length > 0 && svgContainer && projection) {
        drawFlightsOnGlobe(allFlights);
        console.log("Flights has data");
    }

    // The onMount function here loads as soon as the browser starts. The globe for instance should be loaded when the browser starts, because the globe is the main element on the screen. The functionality should also be loaded with it, because the globe should work accordingly when used.
    onMount( async() => {
        
        initialScale = Math.min(width, height) / 2.2;

        projection = d3.geoOrthographic()
        .rotate([0, 0])
        .center([0, 0])
        .clipAngle(90)
        .scale(initialScale)
        .translate([width / 2, height / 2])

        path = d3.geoPath(projection);

        svg = d3.select(svgContainer);

        mapDrawing({ svg, path });

        interactions({
            svg: svg,
            projection: projection,
            path: path,
            initialScale: initialScale,
            updateFlights: updateFlights
        });

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

        allFlights = await fetchData(false);

        // elke 2 minuten data verversen = 120000 ms
        // "allFlights" will be updated
        const pollingInterval = 120000;
        intervalID = setInterval(async () => {
            allFlights = await fetchData(true);
        }, pollingInterval);

        return () => {
            clearInterval(intervalID);
            if (timer) timer.stop();
        }
    })
    </script>

<!-- I am placing the HTML in the Svelte component, because the HTML uses elements that are not considered HTML. For instance the '<svelte:window....../>' -->

<!-- ------HTML------ -->

    <!-- Here the width and height are determined by the size of the window that is being used. -->
    <svelte:window bind:innerWidth={width} bind:innerHeight={height} />

    <!-- Title -->
    <h1>Flight Tracker</h1>

	<svg id="globe" bind:this={svgContainer}></svg>

    <!-- With the '{#if (data)}', the code within only happens when this is triggerd on the screen. This code snippet will only show up when hovered over the aircrafts. -->
    {#if hoveredFlight && !selectedFlight}
    <TooltipSetup
    hoveredFlight={hoveredFlight}
    mouseX={mouseX}
    mouseY={mouseY}
    send={send}
    receive={receive}
    />

    {/if}

    {#if selectedFlight}
    <!-- In svelte, not using the capital letters will result in using the tag as html instead of javascript. -->
    <FlightCard
    selectedFlight={selectedFlight}
    on:close={() => selectedFlight = null}
    receive={receive}
    send={send}
    />
    {/if}

    



    