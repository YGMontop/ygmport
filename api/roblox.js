// Roblox API Proxy Handler
// This handles requests to fetch Roblox game statistics

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Get universe IDs from query parameter
        const { ids } = req.query;

        if (!ids) {
            res.status(400).json({ error: 'Missing universe IDs parameter' });
            return;
        }

        // Fetch game data from Roblox API
        const gameResponse = await fetch(`https://games.roblox.com/v1/games? universeIds=${ids}`);
        
        if (!gameResponse.ok) {
            throw new Error(`Roblox API returned status ${gameResponse.status}`);
        }

        const gameData = await gameResponse.json();

        // Return the data
        res.status(200).json(gameData);

    } catch (error) {
        console.error('Error fetching from Roblox API:', error);
        res.status(500).json({ 
            error: 'Failed to fetch game data',
            message: error.message 
        });
    }
}
