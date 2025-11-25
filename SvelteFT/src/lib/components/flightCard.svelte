

<script>


    import { fly, scale, fade, crossfade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    // Receive the data from the main '+page.svelte'
    export let selectedFlight; 
    
    // This function closes the flight card information
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    const [send, receive] = crossfade({
        // Animation duration from tooltip to flight-card
        duration: 600,
        easing: quintOut,
        // Backup for the animation. If animation does not work, scale the animation
        fallback: scale
    })

    function close() {
        dispatch('close');
    }

</script>

<!-- Here I use transition to let the click on the aircraft show an animation to further enhance the experience of the user -->
<!-- I use the question mark '?' to let the prevent crashes, instead it should be undefined, when not found. So what it does is, it searches for the ID, if found it will work accordingly, if not found it will only be undefined, and not crash. -->
<div class="flight-card"
    in:receive={{ key: selectedFlight.id}}
    out:send={{ key: selectedFlight?.id }}>
    <!-- transition:fly={{ x: -50, opacity: 0, duration: 400, easing: cubicOut }}> -->
        <header>
            <!-- With the stoppropagation, I ensure that the cross button on the flight-card is the only item that is clickable. Everthing under that layer is untouchable. -->
            <button class="closeButton" on:click|stopPropagation={close}>x</button>
            <h2>Flight Information</h2>
            <div>
                <p>
                    {selectedFlight.estDepartureAirport || '?'} - {selectedFlight.estArrivalAirport || '?'}
                </p>
            </div>
            <p>Call-sign: {selectedFlight.callSign || 'N/A'}</p>
            <!-- with Number and toFixed, the velocity will be displayed without a decimal. The "Number" prevents the velocity in becoming a string -->
            <p>Speed: {Number(selectedFlight.velocity * 3.6 || 'N/A').toFixed(0)} km/h</p>
            <p>coordinates: ({selectedFlight.longitude}, {selectedFlight.latitude})</p>
            <p>Origin country: {selectedFlight.origin_country || "N/A"}</p>
            <p>Vertical rate: {selectedFlight.vertical_rate || "0"} m/s</p>
            <p>altitude: {selectedFlight.geo_altitude || "0"} m</p>
            <p>{selectedFlight.on_ground}</p>
        </header>
    </div>

    <style>

        h2 {
            margin-top: 2em;
            font-size: 32px;
            width: 90%;

            /* Text-alignment within div */
            align-items: start;
            margin: 2em auto;
            text-align: start;
        }
        p {
            /* border: 2px solid yellow; */
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 10px;
            width: 90%;
            height: 2em;
            font-size: 20px;
            border-radius: 15px;
            margin: 1em auto;

            background-color: rgba(0, 0, 0, 75%);

        }

        .flight-card {
            /* display: flex; */
            /* align-items: flex-start;
            justify-content: center; */
            position: absolute;
            top: 20px;
            left: 20px;
            width: 30%;
            height: 100vh;
            /* padding-left: 10px; */
            background-color: rgba(0, 0, 0, 70%);
            color: white;
            border-radius: 15px;

            z-index: 2000;
        }

        .closeButton {
            position: absolute;
            right: 10px;
            top: 10px;
            /* "X" styling */
            font-size: 36px;
            font-weight: 700;
            color: white;
            /* ------ENDING------ */

            padding: 0;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 2002;

            /* ------Box styling------ */

            background-color: rgba(0, 0, 0, 80%);
            border: none;
        }
    </style>