
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
    import { flightAnimation } from '$lib/components/timerBasedAnimation';
    import SearchPanel from '$lib/components/searchPanel.svelte';

    import { fade, scale, crossfade } from 'svelte/transition';
    import { cubicOut, quintOut } from 'svelte/easing'

    import { onMount } from 'svelte'

    // ------Global variables------

    // The variables will be placed outside the scope. The variables cannot be used for other functions if used in one function.
    let width;
    let height;

    // dataHandling for the aircrafts
    let allFlights = [];
    let searchQuery = '';
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
    let userLocation = null;

    // For hover effect on aircrafts
    let hoveredFlight = null;
    let mouseX = 0;
    let mouseY = 0;

    // For flight stats on card
    let selectedFlight = null;

    // Aircraft sizes
    let iconSize = 25;
    let currentSize;

    // Function to locate user and fly to that location
    const flyToUserLocation = () => {
        if (!navigator.geolocation) {
            console.log("geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;

            userLocation = { lat: latitude, long: longitude };
            // The globe rotation animation 
            const targetRotation = [-longitude, -latitude];

            // Zoom in effect
            const targetScale = initialScale * 2.5;

            // Animation smoothing using d3 transition
            d3.transition()
            .duration(2000)
            .ease(d3.easeCubicOut)
            .tween("rotateAndZoom", () => {
                // Interpolate new rotation and scale
                const r = d3.interpolate(projection.rotate(), targetRotation);
                const s = d3.interpolate(projection.scale(), targetScale);

                return (t) => {
                    projection.rotate(r(t));
                    projection.scale(s(t));

                    svg.selectAll("path")
                    .attr("d", path);

                    // Update flights position
                    updateFlights();
                };
            })
            // Update currentZoom at the end of the transition
            .on("end", () => {
                currentZoom = targetScale;
            });
        }, (error) => {
            // If user denies location access or an error occurs
            console.warn("Location access denied or error occured", error)
        });
    };


    

    $: if (svgContainer && projection && allFlights.length > 0) {
        currentSize = iconSize;

        const trigger = searchQuery;
        drawFlightsOnGlobe(allFlights);
    };

    // The fallback run when the elemens is not transiting as should be
    // The 'node' here is the DOM element, whcih gets manipulated. It will show a new layer onclick 
    const [send, receive] = crossfade({
        duration: 500,
        easing: cubicOut,

        // 'params' is the object that is getting passed to the html
        // The 'key' property is used to match the animation with its endpoint
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

        const query = searchQuery ? searchQuery.toLowerCase().trim() : '';


        svg.selectAll("image.flight")
                .attr("width", d => {
                    const callSign = d.callSign ? d.callSign.toLowerCase().trim() : '';
                    const isMatch = query !== '' && callSign.includes(query);
                    return isMatch ? 50 : currentSize;
                })
                .attr("height", d => {
                    const callSign = d.callSign ? d.callSign.toLowerCase().trim() : '';
                    const isMatch = query !== '' && callSign.includes(query);
                    return isMatch ? 50 : currentSize;
                })
                .each(function(d) {
                    const callSign = d.callSign ? d.callSign.toLowerCase().trim() : '';
                    if (query !== '' && callSign.includes(query)) {
                        // Bring matched aircraft to front
                        d3.select(this).raise();
                    }
                });

        if (userLocation) {
            const userMarker = svg.selectAll(".user-marker-group")
            .data([userLocation]);

            const enterGroup = userMarker.enter()
            .append("g")
            .attr("class", "user-marker-group")
            .on("click", (e) => e.stopPropagation());

            enterGroup.append("circle")
            .attr("class", "user-pulse-ring")
            .attr("r", 10)
            .attr("fill", "rgba(0, 123, 255, 0.3)")
            .attr("oppacity", 0.4);

            enterGroup.append("circle")
            .attr("class", "userDot")
            .attr("r", 5)
            .attr("fill", "#007bff")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

            userMarker.merge(enterGroup)
            .each(function(d) {
                const coords = projection([d.long, d.lat]);

                const center = projection.invert([width / 2, height / 2]);
                const distance = d3.geoDistance(center, [d.long, d.lat], center);

                // Show marker only if vissible on globe
                if (distance < Math.PI / 2) {
                    d3.select(this)
                    .style("display", "block")
                    .attr("transform", `translate(${coords[0]}, ${coords[1]})`)
                    .raise();
                } else {
                    d3.select(this)
                    .style("display", "none")
                }
            })
        }
    };

    // ------Data cleaning for aircrafts------
    const drawFlightsOnGlobe = (flights) => {

        flightData = cleanFlightData(flights);

        const query = searchQuery ? searchQuery.toLowerCase().trim() : '';
        
        svg.selectAll("image.flight")
        .data(flightData, d => d.id)
        .join(enter => enter.append("image")
            .attr("class", "flight")

            // Aircraft icon
            .attr("href", "/flight-plane-svgrepo-com.svg")

            // Here the airplanes size is determined at start
            .attr("width", iconSize)
            .attr("height", iconSize)

            .each(function(d) {
                const callSign = d.callSign ? d.callSign.toLowerCase().trim() : '';
                if (query !== '' && callSign.includes(query)) {
                    // Bring matched aircraft to front
                    d3.select(this).raise();
                }
            })

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
                d3.select(event.currentTarget)
                .raise();

                // Important to see changes made with hover
                updateFlights();
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

       timer = flightAnimation({
        flightData: flightData,
        updateFlights: updateFlights
       });

       allFlights = await fetchData(false);

    //    Timeout is used to ensure the globe gets rendered fully before executing the user location
       setTimeout(() => {
        flyToUserLocation();
       }, 500)

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
     <SearchPanel on:search={(e) => searchQuery = e.detail.query} />
    <!-- <div class="Text-container">
        <h1>Flight Tracker</h1>
        <p class="Description">This flighttracker gives insight about the passengers aircrafts in real time</p>
    </div> -->

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

    



    