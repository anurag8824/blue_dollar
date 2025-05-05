const express = require('express');
const router = express.Router();
const db = require('../.././../../config/connectDB'); 

router.get('/betting-history/:phone', async (req, res) => {
    const { phone } = req.params;
    const page = parseInt(req.query.page, 10) || 1; 


    if (!phone) {
        return res.status(400).json({ error: 'Phone number parameter is required.' });
    }

    try {
        const [history] = await db.execute(
            `SELECT id, roundId,matchId, card, amount, result, win_amount, created_at
             FROM dragon_tiger
             WHERE phone = ?
             ORDER BY created_at DESC`,
            [phone]
        );

        const [[{ totalCount }]] = await db.execute(
            `SELECT COUNT(*) as totalCount FROM dragon_tiger WHERE phone = ?`,
            [phone]
        );

        const formattedHistory = history.map(bet => ({
            ...bet,
            win_amount: bet.result === 'pending' ? '-' : Number(bet.win_amount) || 0,
        }));

        res.status(200).json({
            data: formattedHistory,
            
        });

    } catch (error) {
        console.error(`Error fetching betting history for phone ${phone}:`, error);
        res.status(500).json({ error: 'Failed to retrieve betting history.' });
    }
});


// Aviator Betting History Endpoint
router.get('/aviator-history/:phone', async (req, res) => {
    const { phone } = req.params;

    if (!phone) {
        return res.status(400).json({
            status: false,
            message: 'Phone number parameter is required.',
            data: null,
            pagination: null
        });
    }
  

    try {
        const [aviatorHistory] = await db.execute(
            `SELECT id, phone, amount, type, period, crash, status, 
                    DATE_FORMAT(time, '%Y-%m-%d %H:%i:%s') AS timeFormatted 
             FROM aviator_result 
             WHERE phone = ? 
             ORDER BY time DESC `,
            [phone]
        );

        const [[{ totalCount }]] = await db.execute(
            `SELECT COUNT(*) as totalCount FROM aviator_result WHERE phone = ?`,
            [phone]
        );


        res.status(200).json({
            status: true,
            message: 'Aviator history fetched successfully.',
            data: aviatorHistory, 
           
        });

    } catch (error) {
        console.error(`Error fetching Aviator history for phone ${phone}:`, error);
        res.status(500).json({
            status: false,
            message: 'Failed to retrieve Aviator betting history.',
            error: error.message,
            data: null,
        });
    }
});


// Replace with your actual DB instance path

router.get('/lottery-history/:phone', async (req, res) => {
    const { phone } = req.params;
    console.log(phone,"dgfhjgfdsghphone")
    const page = parseInt(req.query.page, 10) || 1;


    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required.' });
    }

    try {
        // Get filtered bet history
        const [history] = await db.execute(
            `SELECT roundId, price, number, type, result
             FROM lottery_bet
             WHERE phone = ?`,
            [phone,]
        );

        // Get total count for pagination
        const [[{ totalCount }]] = await db.execute(
            `SELECT COUNT(*) as totalCount FROM lottery_bet WHERE phone = ?`,
            [phone]
        );

        res.status(200).json({
            status: true,
            data: history,
          
        });

    } catch (error) {
        console.error(`Error fetching lottery history for phone ${phone}:`, error);
        res.status(500).json({ status: false, error: 'Failed to retrieve lottery history.' });
    }
});






module.exports = router;