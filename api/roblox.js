import fetch from "node-fetch";

/**
 * Fetch game data for a universe ID
 * @param {string|number} universeId
 * @returns {Promise<Object|null>}
 */
async function getGameData(universeId) {
  try {
    const url = `https://games.roblox.com/v1/games?universeIds=${universeId}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      timeout: 10000
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.data || !data.data.length) {
      console.log("No game data found for this universe ID.");
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error fetching game data:", err.message);
    return null;
  }
}

/**
 * Optional: Get universe ID from a public place ID by scraping the game page
 * @param {string|number} placeId
 * @returns {Promise<number|null>}
 */
async function getUniverseIdFromPlace(placeId) {
  try {
    const url = `https://www.roblox.com/games/${placeId}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      timeout: 10000
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    // Search for universeId in page HTML
    const match = html.match(/"UniverseId":(\d+)/);
    if (!match) {
      console.log("Universe ID not found in page.");
      return null;
    }

    return Number(match[1]);
  } catch (err) {
    console.error("Error fetching universe ID:", err.message);
    return null;
  }
}

// Example usage
(async () => {
  const placeId = 137253865256902; // your place ID
  const universeId = await getUniverseIdFromPlace(placeId);

  if (!universeId) return;

  const data = await getGameData(universeId);
  console.log(data);
})();
