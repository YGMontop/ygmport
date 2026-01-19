// Function to get Roblox game statistics
async function getRobloxGameStats(universeId) {
    try {
        // Fetch game details
        const gameResponse = await fetch(https://games.roblox.com/v1/games? universeIds=${universeId});
        const gameData = await gameResponse.json();

        if (!gameData. data  gameData.data.length === 0) {
            throw new Error('Game not found');
        }

        const game = gameData.data[0];

        // Fetch votes (likes/dislikes)
        const votesResponse = await fetch(https://games.roblox.com/v1/games/votes?universeIds=${universeId});
        const votesData = await votesResponse.json();
        const votes = votesData.data[0]  { upVotes: 0, downVotes: 0 };

        // Fetch thumbnail
        const thumbnailResponse = await fetch(https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false);
        const thumbnailData = await thumbnailResponse.json();
        const thumbnail = thumbnailData.data[0]?.imageUrl || '';

        // Return all stats
        return {
            name: game.name,
            description: game.description,
            creator: game.creator. name,
            creatorType: game.creator.type,
            visits: game.visits,
            favorites: game.favoritedCount,
            likes: votes.upVotes,
            dislikes:  votes.downVotes,
            playing: game.playing,
            maxPlayers: game.maxPlayers,
            price: game.price,
            thumbnail: thumbnail,
            created: game.created,
            updated: game.updated
        };

    } catch (error) {
        console.error('Error fetching game stats:', error);
        throw error;
    }
}

// Example usage:
getRobloxGameStats(920587237).then(stats => {
    console.log('Game Name:', stats.name);
    console.log('Visits:', stats.visits);
    console.log('Favorites:', stats. favorites);
    console.log('Likes:', stats.likes);
    console.log('Dislikes:', stats.dislikes);
    console.log('Currently Playing:', stats.playing);
    console.log('Max Players:', stats.maxPlayers);
    console.log('Creator:', stats.creator);
    console.log('Full stats:', stats);
});
