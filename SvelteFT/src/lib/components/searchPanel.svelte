

<script>
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let isOpen = false;
    let searchQuery = '';

    const togglePanel = () => {
        isOpen = !isOpen;
    }

    const handleSearch = () => {
        dispatch('search', { query: searchQuery });
    }
</script>

<div class="panel-container" class:open={isOpen}>

    <div class="handle-area" on:click={togglePanel} role="button" tabindex="0" aria-label={isOpen ? "Close panel" : "Open panel"}>
        <div class="handle-bar"></div>
    </div>

    <div class="Text-container">
        <h1>Flight Tracker</h1>
        <p class="Description">This flighttracker gives insight about the passengers aircrafts in real time</p>
    </div>

    <div class="search-wrapper" transition:slide={{ duration: 400, easing: quintOut, axis: 'y' }}>
        <input type="text" placeholder="Search flights..." bind:value={searchQuery} on:input={handleSearch} on:keydown={(e) => e.key === 'Enter' && handleSearch()} />
        <button class="search-button" on:click={handleSearch}>Search</button>
    </div>
</div>