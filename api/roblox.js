import fetch from "node-fetch";

async function getUniverseIdFromPlace(placeId) {
  console.log(`Fetching universe ID for place ID: ${placeId}`);
  try {
    const res = await fetch(`https://www.roblox.com/games/${placeId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      console.log(`Failed to fetch page for place ID ${placeId}: HTTP ${res.status}`);
      return null;
    }

    const html = await res.text();
    const match = html.match(/"UniverseId":(\d+)/);

    if (!match) {
      console.log(`Universe ID not found in page for place ID ${placeId}`);
      return null;
    }

    const universeId = Number(match[1]);
    console.log(`Place ID ${placeId} maps to universe ID ${universeId}`);
    return universeId;
  } catch (err) {
    console.log(`Error fetching universe ID for place ID ${placeId}:`, err.message);
    return null;
  }
}

export default async function handler(req, res) {
  let ids = (req.query.ids || "").split(",").map(s => s.trim()).filter(Boolean);
  console.log("Received IDs:", ids);

  if (!ids.length) return res.status(400).send("missing ids");

  // Convert all IDs to universe IDs
  const universeIds = [];
  for (const id of ids) {
    const uniId = await getUniverseIdFromPlace(id);
    if (uniId) universeIds.push(uniId);
  }

  console.log("Universe IDs to fetch:", universeIds);

  if (!universeIds.length) {
    console.log("No valid universe IDs found.");
    return res.status(200).json([]);
  }

  try {
    const url = `https://games.roblox.com/v1/games?universeIds=${universeIds.join(",")}`;
    console.log(`Fetching game data from URL: ${url}`);

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      console.log(`Roblox API responded with HTTP ${response.status}`);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("Received game data:", data);

    res.status(200).json(data);
  } catch (err) {
    console.log("Error fetching game data:", err.message);
    res.status(500).json({ error: "Failed to fetch game data", details: err.message });
  }
}
