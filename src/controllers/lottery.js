const cron = require("node-cron");
const connection = require("../config/connectDB"); // Update the path if needed

// Generate round_id like "20250501-0925"

console.log("lottey controller is runnnign !")




function generateRoundId() {
  const now = new Date();
  const date = now.toISOString().split("T")[0].replace(/-/g, "");
  const time = `${now.getHours()}${now.getMinutes()}`;
  return `${date}-${time}`;
}

// 🔁 Create new lottery round at 9:25 AM every day
cron.schedule("00 19 * * *", async () => {
  try {
    const roundId = generateRoundId();

    const sql = `INSERT INTO lottery (round_id, status, result,type) VALUES (?, ?, ?,?)`;
    await connection.query(sql, [roundId, true, false,"small"]);

    console.log(
      `✅ [${new Date().toLocaleString()}] New lottery round created: ${roundId}`
    );
  } catch (error) {
    console.error("❌ Error inserting lottery round:", error);
  }
});

// 🔁 Close the round at 3:30 PM every day
cron.schedule("00 17 * * *", async () => {
  try {
    // Get the latest active lottery round
    const [rows] = await connection.query(
      "SELECT round_id FROM lottery WHERE status = true AND type ='small' ORDER BY id DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return console.log("⚠️ No active lottery round to close at 3:30 PM");
    }

    const roundId = rows[0].round_id;

    const sql = `UPDATE lottery SET status = false WHERE round_id = ?`;
    await connection.query(sql, [roundId]);

    console.log(
      `✅ [${new Date().toLocaleString()}] Lottery round closed: ${roundId}`
    );
  } catch (error) {
    console.error("❌ Error closing lottery round:", error);
  }
});


// weekly lottey inserting 

// 🆕 Create lottery round every Monday at 12:00 AM
cron.schedule("0 0 * * 1", async () => {
  try {
    const roundId = generateRoundId();

    const sql = `INSERT INTO lottery (round_id, status, result,type) VALUES (?, ?, ?,?)`;
    await connection.query(sql, [roundId, true, false,"big"]);

    console.log(
      `✅ [${new Date().toLocaleString()}] New weekly lottery round created: ${roundId}`
    );
  } catch (error) {
    console.error("❌ Error inserting weekly lottery round:", error);
  }
});


// 🔁 Close the round every Sunday at 12:00 AM (start of Sunday)
cron.schedule("0 0 * * 0", async () => {
  try {
    const [rows] = await connection.query(
      "SELECT round_id FROM lottery WHERE status = true AND type = 'big' ORDER BY id DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return console.log("⚠️ No active weekly lottery round to close");
    }

    const roundId = rows[0].round_id;

    const sql = `UPDATE lottery SET status = false WHERE round_id = ?`;
    await connection.query(sql, [roundId]);

    console.log(
      `✅ [${new Date().toLocaleString()}] Weekly lottery round closed: ${roundId}`
    );
  } catch (error) {
    console.error("❌ Error closing weekly lottery round:", error);
  }
});


const checkLottery = async (req, res) => {
  try {
    const sql = `SELECT * FROM lottery WHERE status = 1 ORDER BY id DESC`;
    const [rows] = await connection.query(sql);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ msg: "No lottery entries found." });
    }

    return res.json(rows);
  } catch (error) {
    console.error("Error fetching latest lottery:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const ticketBook = async (req, res) => {
  const { betRoundId, number, price, type } = req.body;

  const auth = req.cookies.auth;
  console.log(auth, "auth is here from frontend ");
  if (!auth) {
    return res.redirect("/login");
  }

  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `money`,`win_wallet` FROM users WHERE `token` = ? ",
    [auth]
  );
  console.log(user, "user is here");
  const phone = user[0]?.phone;
  console.log();

  try {
    // Check if round_id exists in lottery table
    if (user[0].win_wallet + user[0]?.money < price)
      return res.status(204).json({
        msg: "Balance is too less ! Please Recharge in Your Account ",
        isStatus:false
      });

    if (user[0].win_wallet >= price) {
      await connection.query(
        "UPDATE users SET win_wallet = win_wallet - ? WHERE phone = ?",
        [price, phone]
      );
    } else {
      await connection.query(
        "UPDATE users SET win_wallet = 0, money = money- ? WHERE phone = ?",
        [price - user[0].win_wallet, phone]
      );
    }

    const [row] = await connection.query(
      `SELECT * FROM lottery WHERE round_id = ?`,
      [betRoundId]
    );

    if (!row || row.length === 0) {
      return res
        .status(200)
        .json({ msg: "This Round ID Lottery doesn't exist!" ,isStatus:false});
    }

    // Insert into lottery_bet table
    const insertQuery = `
          INSERT INTO lottery_bet (roundId, number, price, type,phone)
          VALUES (?, ?, ?, ?,?)
        `;

    await connection.query(insertQuery, [betRoundId, number, price, type, phone]);

    return res.status(200).json({ msg: "Bet placed successfully!" , isStatus:true});
  } catch (error) {
    console.error("Error placing bet:", error);
    return res.status(500).json({ msg: "Internal Server Error",isStatus:false });
  }
};

const history = async (req, res) => {
  const auth = req.cookies.auth;
  console.log(auth, "auth is here from frontend ");
  if (!auth) {
    return res.redirect("/login");
  }

  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `money`,`win_wallet` FROM users WHERE `token` = ? ",
    [auth]
  );
  console.log(user, "user is here");
  const phone = user[0]?.phone;

  const [history] = await connection.query(
    "SELECT * FROM lottery_bet WHERE phone = ?",
    [phone]
  );

  if (!history) {
    return res.status(203).json({ msg: "History is not found" });
  }

  res.status(200).json(history);
};

const lotteryList = async (req, res) => {
  const [row] = await connection.query(
    `SELECT * FROM lottery WHERE result = 0`
  );
  try {
    if (row.length > 0) {
      return res.status(200).json({ data: row });
    }
    res.status(200).json({ data: "No Result Pending !" });
  } catch (error) {
    return res.status(500).json({ data: "Internal server Error !" });
  }
};

// function for updating user wallet and user pending lottery status !

const lottery_cal = async (id, data) => {
  if (!id || !data) return false;

  console.log(data,"datanalhdjlkflmflfllo")

  try {
    const [bet] = await connection.query(
      "SELECT * FROM lottery_bet WHERE roundId = ?",
      [id]
    );

    const Big_lottery = {
      51:5100,
      100:11000,
      151:21000,
      251:50000,
      500:100000
    }

    console.log(bet,"bet data jhkolphgvjbkl;")

    if (bet.length === 0) return true;

    const promises = bet.map(async (item) => {
      const result = data[item.price];
      console.log(result,"result data ")
      const isWin = result.includes(item.number);

      if (isWin && item.type == "small") {
        await connection.query(
          `UPDATE users SET win_wallet = win_wallet + ? WHERE phone = ?`,
          [item.price * 20, item.phone]
        );

        await connection.query(
          `UPDATE lottery_bet SET result = ? WHERE id = ?`,
          ["won", item.id]
        );
      } else {
        await connection.query(
          `UPDATE lottery_bet SET result = ? WHERE id = ?`,
          ["loss", item.id]
        );
      }
      if (isWin && item.type == "big") {
        await connection.query(
          `UPDATE users SET win_wallet = win_wallet + ? WHERE phone = ?`,
          [Big_lottery[price], item.phone]
        );

        await connection.query(
          `UPDATE lottery_bet SET result = ? WHERE id = ?`,
          ["won", item.id]
        );
      } else {
        await connection.query(
          `UPDATE lottery_bet SET result = ? WHERE id = ?`,
          ["loss", item.id]
        );
      }
    });

    // Wait for all updates to complete
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("❌ Error in lottery_cal:", error);
    return false;
  }
};

const setLotteryResult = async (req, res) => {

  console.log(req.body,"get result")
  const { type, data, roundId } = req.body;
  
  if (!type || !data || !roundId)
    return res.status(203).json({ msg: "please share all details !" });

  const resultofcal = await lottery_cal(roundId, data);
  if (!resultofcal)
    return res
      .status(200)
      .json({ msg: "Error in Bet Calcuation Please Try Again Results !" });

  await connection.query(
    "INSERT INTO lottery_result (round_id, type, data) VALUES (?, ?, ?)",
    [roundId, type, JSON.stringify(data)]
  );

  await connection.query(
    `UPDATE lottery SET result = ?, status = ? WHERE round_id = ?`,
    [true, false, roundId.toString()]
  );

  res.status(200).json({ msg: "Result Suceesfully Updated !" });
};

const lotteryData = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(204).json({ msg: "Round Id is Not Defined" });

  try {
    const [rows] = await connection.query(
      "SELECT * FROM lottery_bet WHERE roundId = ?",
      [id]
    );



    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("❌ Error fetching lottery data:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};



module.exports = {
  checkLottery,
  ticketBook,
  history,
  lotteryList,
  setLotteryResult,
  lotteryData
};
