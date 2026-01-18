// netlify/functions/roblox.js
// GET /.netlify/functions/roblox?ids=383310974,13301445090
const axios = require('axios');

exports.handler = async (event) => {
  const ids = (event.queryStringParameters.ids || '').split(',').map(s => s.trim());
  if (!ids.length) return { statusCode: 400, body: 'missing ids' };

  const url = `https://games.roblox.com/v1/games?universeIds=${ids.join(',')}`;
  try {
    const { data } = await axios.get(url, { timeout: 4000 });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};