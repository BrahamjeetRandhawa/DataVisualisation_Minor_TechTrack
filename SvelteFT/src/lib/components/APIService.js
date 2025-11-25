
    // !Important localStorage setup for flights
    const CACHE_KEY = 'flightDataStorage';
    const CACHE_TIMESTAMP = 'flightDataTime';
    const CACHE_DURATION = 5 * 60 * 1000;


    // function for localStorage in case of token limit reach

export const fetchData = async (forceRefresh = false) => {
     try {
            const nowData = Date.now();

            if (!forceRefresh) {
                const storedData = localStorage.getItem(CACHE_KEY);
                const storedTime = localStorage.getItem(CACHE_TIMESTAMP);

                if (storedData && storedTime && (nowData - storedTime < CACHE_DURATION)) {
                    console.log('localStorage is being used!');
                    return JSON.parse(storedData);
                    return;
                }
            }

            console.log('Fresh data fetch from API works');
            const response = await fetch('/API/flights');

            if (!response.ok) {
                console.error('Data fetch error:', response.status);
                return[];
            }
            if (response.ok) {
                console.log('Data Succes')
            }
            const flightsData = await response.json();

            if (Array.isArray(flightsData)) {
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(flightsData));
            localStorage.setItem(CACHE_TIMESTAMP, nowData.toString());
            console.log('Data secured in localStorage');

            return flightsData;
            }
            return [];
            
        } catch (error) {
            console.error('error fetching data:', error);

            const fallBackData = localStorage.getItem(CACHE_KEY);
            if (fallBackData) {
                console.warn('API failed, using backup cache');
                return JSON.parse(fallBackData);
            }
            
            return[];
        }
    }


    export const fetchFlightDetails = async (icao24) => {
        try {
            const res = await fetch(`/API/flights/${icao24}`);
            const data = await res.json();

            return {
                estArrivalAirport: data.estArrivalAirport || 'Unknown',
                estDepartureAirport: data.estDepartureAirport || 'Unknown'
            };
        } catch (err) {
            console.error(err);
            return { estArrivalAirport: 'Error' };
        }
    }