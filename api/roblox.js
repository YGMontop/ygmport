// Simple local development server with CORS proxy
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Proxy endpoint for Roblox API with retry logic
app.get('/api/roblox', async (req, res) => {
    try {
        const { ids } = req.query;

        if (!ids) {
            return res.status(400).json({ error: 'Missing universe IDs parameter' });
        }

        let universeId = ids;

        // First, try to convert place ID to universe ID if needed
        try {
            const placeResponse = await fetch(`https://apis.roblox.com/universes/v1/places/${ids}/universe`);
            if (placeResponse.ok) {
                const placeData = await placeResponse.json();
                if (placeData.universeId) {
                    universeId = placeData.universeId;
                    console.log(`Converted place ID ${ids} to universe ID ${universeId}`);
                }
            }
        } catch (conversionError) {
            console.log(`Could not convert ID, using as-is: ${ids}`);
        }

        // Retry logic for rate limiting
        let retries = 0;
        let maxRetries = 3;
        let delay = 1000;

        while (retries <= maxRetries) {
            try {
                // Add delay before request
                if (retries > 0) {
                    const waitTime = delay * Math.pow(2, retries - 1); // Exponential backoff
                    console.log(`Retry ${retries} for universe ${universeId}, waiting ${waitTime}ms`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                // Fetch game data and thumbnail in parallel
                const gameResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
                
                if (gameResponse.ok) {
                    const gameData = await gameResponse.json();
                    
                    // Try to fetch thumbnail separately (non-blocking)
                    try {
                        const thumbnailResponse = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false`);
                        if (thumbnailResponse.ok) {
                            const thumbnailData = await thumbnailResponse.json();
                            if (gameData.data && gameData.data.length > 0 && thumbnailData.data && thumbnailData.data.length > 0) {
                                gameData.data[0].thumbnail = thumbnailData.data[0].imageUrl;
                                console.log(`✓ Thumbnail loaded for universe ${universeId}: ${thumbnailData.data[0].imageUrl}`);
                            }
                        } else {
                            console.log(`Thumbnail API returned ${thumbnailResponse.status} for universe ${universeId}`);
                        }
                    } catch (thumbError) {
                        console.log(`Could not fetch thumbnail for universe ${universeId}: ${thumbError.message}`);
                    }
                    
                    return res.json(gameData);
                }

                if (gameResponse.status === 429) {
                    console.log(`Rate limited for universe ${universeId} (attempt ${retries + 1}/${maxRetries + 1})`);
                    retries++;
                    continue;
                }

                throw new Error(`Roblox API returned status ${gameResponse.status}`);

            } catch (fetchError) {
                if (retries >= maxRetries) {
                    throw fetchError;
                }
                retries++;
            }
        }

        // If we exhausted retries, return placeholder
        console.log(`Max retries reached for universe ${universeId}, returning placeholder`);
        res.json({
            data: [{
                name: "Rate Limited",
                playing: 0,
                visits: 0,
                favoritedCount: 0,
                creator: { name: "" },
                thumbnail: ""
            }]
        });

    } catch (error) {
        console.error('Error fetching from Roblox API:', error);
        res.status(500).json({ 
            error: 'Failed to fetch game data',
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🔗 Open http://localhost:${PORT}/index.html in your browser\n`);
});
