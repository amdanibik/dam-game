const { kv } = require('@vercel/kv'); // Using CommonJS since package.json isn't explicitly type: module

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { uid, name, picture, moves, mode } = req.body;

        if (!uid || !name) {
            return res.status(400).json({ error: 'Missing req fields' });
        }

        const userKey = `user:${uid}`;
        let userData = await kv.hgetall(userKey);

        if (!userData || Object.keys(userData).length === 0) {
            userData = {
                uid,
                name,
                picture: picture || '',
                wins: 1,
                bestMoves: moves,
                lastMode: mode,
                lastWin: Date.now()
            };
        } else {
            userData.wins = Number(userData.wins || 0) + 1;
            userData.bestMoves = userData.bestMoves ? Math.min(Number(userData.bestMoves), moves) : moves;
            userData.lastMode = mode;
            userData.lastWin = Date.now();
            userData.name = name;
            if (picture) userData.picture = picture;
        }

        // HSET in @vercel/kv accepts an object
        await kv.hset(userKey, userData);

        // Add to sorted sets
        await kv.zadd("leaderboard:wins", { score: userData.wins, member: uid });
        await kv.zadd("leaderboard:moves", { score: userData.bestMoves, member: uid });

        return res.status(200).json({ success: true, data: userData });
    } catch (error) {
        console.error('Error saving score:', error);
        return res.status(500).json({ error: 'Internal Error', details: error.message });
    }
};
