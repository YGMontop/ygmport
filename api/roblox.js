import axios from 'axios';

export default async function handler(req, res) {
  const ids = (req.query.ids || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!ids.length) {
    return res.status(400).send('missing ids');
  }

  const url = `https://games.roblox.com/v1/games?universeIds=${ids.join(',')}`;

  try {
    const { data } = await axios.get(url, { timeout: 8000 }); // increased timeout
    res.status(200).json(data);
  } catch (e) {
    if (e.response) {
      // Roblox responded with an error status
      console.error('Roblox API error:', e.response.status, e.response.data);
      res.status(500).json({ error: 'Roblox API error', details: e.response.data });
    } else if (e.request) {
      // No response received
      console.error('No response from Roblox API:', e.message);
      res.status(500).json({ error: 'No response from Roblox API', details: e.message });
    } else {
      // Something else
      console.error('Unexpected error:', e.message);
      res.status(500).json({ error: 'Unexpected error', details: e.message });
    }
  }
}
