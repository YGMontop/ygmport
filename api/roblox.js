import axios from 'axios';

export default async function handler(req, res) {
  // Cleanly parse IDs from query
  const ids = (req.query.ids || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!ids.length) {
    return res.status(400).send('missing ids');
  }

  const url = `https://games.roblox.com/v1/games?universeIds=${ids.join(',')}`;

  try {
    const { data } = await axios.get(url, { timeout: 4000 });
    res.status(200).json(data);
  } catch (e) {
    console.error('Axios error:', e.response?.status, e.response?.data || e.message);
    res.status(500).json({ error: e.response?.data || e.message });
  }
}
