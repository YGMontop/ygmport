export default async function handler(req, res) {
  let ids = (req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!ids.length) return res.status(400).send('missing ids');

  // Convert place IDs to universe IDs
  const placeResponse = await fetch(
    `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${ids.join(',')}`
  );
  const placeData = await placeResponse.json();
  const universeIds = placeData.map(p => p.universeId).filter(Boolean);

  if (!universeIds.length) return res.status(404).json({ error: 'No valid universe IDs found' });

  // Fetch game data
  const url = `https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Roblox API responded ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error('Roblox fetch error:', e.message);
    res.status(500).json({ error: 'Failed to fetch game data', details: e.message });
  }
}
