const cron = require("node-cron");
const connection = require("../config/connectDB"); // Update the path if needed

// Generate round_id like "20250501-0925"
function generateRoundId() {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const time = `${now.getHours()}${now.getMinutes()}`;
  return `${date}-${time}`;
}

// 🔁 Create new lottery round at 9:25 AM every day
cron.schedule('25 9 * * *', async () => {
  try {
    const roundId = generateRoundId();

    const sql = `INSERT INTO lottery (round_id, status, result) VALUES (?, ?, ?)`;
    await connection.query(sql, [roundId, true, false]);

    console.log(`✅ [${new Date().toLocaleString()}] New lottery round created: ${roundId}`);
  } catch (error) {
    console.error("❌ Error inserting lottery round:", error);
  }
});

// 🔁 Close the round at 3:30 PM every day
cron.schedule('30 15 * * *', async () => {
  try {
    // Get the latest active lottery round
    const [rows] = await connection.query(
      `SELECT round_id FROM lottery WHERE status = true ORDER BY created_at DESC LIMIT 1`
    );

    if (rows.length === 0) {
      return console.log("⚠️ No active lottery round to close at 3:30 PM");
    }

    const roundId = rows[0].round_id;

    const sql = `UPDATE lottery SET status = false WHERE round_id = ?`;
    await connection.query(sql, [roundId]);

    console.log(`✅ [${new Date().toLocaleString()}] Lottery round closed: ${roundId}`);
  } catch (error) {
    console.error("❌ Error closing lottery round:", error);
  }
});





const checkLottery = async (req, res) => {
  try {
    const sql = `SELECT * FROM lottery ORDER BY id DESC LIMIT 1`;
    const [rows] = await connection.query(sql);

    if (!rows || rows.length === 0) {
        return res.status(404).json({ msg: "No lottery entries found." });
      }

    return res.json({ latestLottery: rows[0] });
  } catch (error) {
    console.error("Error fetching latest lottery:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};


const ticketBook = async(req,res)=>{

    const {roundId,number,price,type} = req.body

    const auth = req.cookies.auth;
    console.log(auth,"auth is here from frontend ")
    if (!auth){
        return res.redirect("/login")
    }

    const [user] = await connection.query("SELECT `phone`, `code`,`invite`, `money`,`win_wallet` FROM users WHERE `token` = ? ", [auth])
    console.log(user,"user is here")
    const phone = user[0]?.phone
    console.log()


    try {
        // Check if round_id exists in lottery table
        const [row] = await connection.query(
          `SELECT * FROM lottery WHERE round_id = ?`,
          [roundId]
        );
      
        if (!row || row.length === 0) {
          return res.status(200).json({ msg: "This Round ID Lottery doesn't exist!" });
        }
      
        // Insert into lottery_bet table
        const insertQuery = `
          INSERT INTO lottery_bet (roundId, number, price, type,phone)
          VALUES (?, ?, ?, ?,?)
        `;
      
        await connection.query(insertQuery, [roundId, number, price, type,phone]);
      
        return res.status(200).json({ msg: "Bet placed successfully!" });
        
      } catch (error) {
        console.error("Error placing bet:", error);
        return res.status(500).json({ msg: "Internal Server Error" });
      }

      
}


const history = async (req,res) =>{

  const auth = req.cookies.auth;
  console.log(auth,"auth is here from frontend ")
  if (!auth){
      return res.redirect("/login")
  }

  const [user] = await connection.query("SELECT `phone`, `code`,`invite`, `money`,`win_wallet` FROM users WHERE `token` = ? ", [auth])
  console.log(user,"user is here")
  const phone = user[0]?.phone
  

  const [history] = await connection.query(
    "SELECT * FROM lottery_bet WHERE phone = ?",
    [phone]
  );

  if(!history){
    return res.status(203).json({msg:"History is not found"})
  }

  res.status(200).json(history)


}

module.exports = { checkLottery,ticketBook ,history};
