

<script>

    import { fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';

    // Receive the data from the main '+page.svelte'
    export let selectedFlight; 
    export let receive;
    export let send;
    const dispatch = createEventDispatcher();
    
    // This function closes the flight card information

    const close=() => {
        dispatch('close');
    }

</script>

<!-- Here I use transition to let the click on the aircraft show an animation to further enhance the experience of the user -->
<!-- I use the question mark '?' to let the prevent crashes, instead it should be undefined, when not found. So what it does is, it searches for the ID, if found it will work accordingly, if not found it will only be undefined, and not crash. -->
<div class="flight-card"
    in:receive={{ key: selectedFlight?.id}}
    out:send={{ key: selectedFlight?.id }}>
        <header>
            <!-- With the stoppropagation, I ensure that the cross button on the flight-card is the only item that is clickable. Everthing under that layer is untouchable. -->
            <button class="closeButton" on:click|stopPropagation={close}>x</button>
            <h2>Flight Information</h2>
            <div>
                <p class="overlayText">
                    {selectedFlight.estDepartureAirport || '?'} - {selectedFlight.estArrivalAirport || '?'}
                </p>
            </div>
            <p class="overlayText">Call-sign: {selectedFlight.callSign || 'N/A'}</p>
            <!-- with Number and toFixed, the velocity will be displayed without a decimal. The "Number" prevents the velocity in becoming a string -->
            <p class="overlayText">Speed: {Number(selectedFlight.velocity * 3.6 || 'N/A').toFixed(0)} km/h</p>
            <p class="overlayText">coordinates: ({selectedFlight.longitude}, {selectedFlight.latitude})</p>
            <p class="overlayText">Origin country: {selectedFlight.origin_country || "N/A"}</p>
            <p class="overlayText">Vertical rate: {selectedFlight.vertical_rate || "0"} m/s</p>
            <p class="overlayText">altitude: {selectedFlight.geo_altitude || "0"} m</p>
            <p class="overlayText">{selectedFlight.on_ground}</p>
        </header>
    </div>
