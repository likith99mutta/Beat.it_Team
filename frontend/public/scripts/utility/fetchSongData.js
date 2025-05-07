async function fetchSongData() {
    try {
        const response = await fetch("http://localhost:3000/api/data/songsData", {
            cache: "no-store", // Disable caching for fetch requests
            credentials: "include" // Include cookies for authentication
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.warn("Failed to fetch song data:", error);
        return []; // Returning an empty array to handle the error!
    }
}

export { fetchSongData };
