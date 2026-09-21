const { kv } = require('@vercel/kv'); // CommonJS

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { type } = req.query; // 'wins' or 'moves'

        let uids = [];
        if (type === 'wins') {
            // zrevrange equivalent: rev: true
            uids = await kv.zrange("leaderboard:wins", 0, 9, { rev: true });
        } else {
            uids = await kv.zrange("leaderboard:moves", 0, 9);
        }

        if (!uids || uids.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Fetch user data for each uid using pipeline for performance
        const pipeline = kv.pipeline();
        uids.forEach(uid => pipeline.hgetall(`user:${uid}`));
        const usersData = await pipeline.exec();

        const result = usersData.map((data, index) => {
            return data;
        }).filter(item => item !== null);

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error leaderboard:', error);
        return res.status(500).json({ error: 'Internal Error', details: error.message });
    }
};
