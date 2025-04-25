const connection = require("../config/connectDB");

const Dragon = async (io) => {
  try {
    const [poolValue] = await connection.execute('SELECT * FROM admin');
    console.log("Admin Pool Value:", poolValue);
  } catch (error) {
    console.error("❌ Error fetching admin pool value:", error.message);
  }
};
const userDekh = async (req,res) =>{
    const auth = req?.cookies?.auth || null;
  if(!auth){
     return res.status(400).json({ error: "Authentication token missing" });
  }
    const [user] = await connection.execute('SELECT phone,money,win_wallet FROM users WHERE token = ?',[auth]);
    const query = `
  SELECT * 
  FROM aviator WHERE status != 0
  ORDER BY id DESC 
  LIMIT 30;
`;
console.log("auth-------",user);

if(user.length ===0){
     return res.status(400).json({ error: "user not find" });
  }
const [result] = await connection.execute(query);
const [betHistory] = await connection.execute(
    `SELECT ar.*, a.*, 
            DATE_FORMAT(ar.time, '%Y-%m-%d %H:%i:%s') AS formatted_time
     FROM aviator_result ar
     JOIN aviator a ON ar.period = a.id
     WHERE ar.phone = ?
     ORDER BY ar.period DESC`,  // Reverse order by period
    [user[0]?.phone]
  );
  
  
  
    res.render('dragon.ejs', {
        csrfToken: 'your_csrf_token',
        user: {
            currency: '₹',
            id: 12345,
        },
        wallet: user[0]?.money+user[0]?.win_wallet,
        settings: {
            minBetAmount: 10,
            maxBetAmount: 10000,
        },
        phone:user[0]?.phone,
        currentGameData: JSON.stringify({ id: 1, name: 'Game Name' }),
        result:result,
        betHistory:betHistory
    });
}
async function reduceWallet(amount,phone,bet){
  const [user] = await connection.execute('select money,win_wallet from users where phone = ?',[phone]);
  let wallet = user[0].money;
  let win = user[0].win_wallet;
  console.log("user detail",user[0].money,user[0].win_wallet);
  
  if(bet>wallet+win){
    return {status:false};
  }
  if(amount>wallet+win){
      return {status:false};
  }
  else{
      wallet = wallet - amount;
      if(wallet<0){
          win = win + wallet;
          wallet = 0 ;
      }
     await connection.execute('UPDATE users SET money = ? , win_wallet = ? where phone = ?',[wallet,win,phone]);
     return {status:true,wallet:win+wallet};
  }
}


async function addWinnings(amount, phone) {
  if (amount <= 0) {
      console.log(`Attempted to add non-positive winnings (${amount}) for ${phone}. Skipping.`);
      return { status: true }; // Not an error, just nothing to add
  }
  try {
      console.log(`Attempting to add winnings: ${amount} to phone: ${phone}`);
      // Add directly to win_wallet
      const [result] = await connection.execute(
          'UPDATE users SET win_wallet = win_wallet + ? WHERE phone = ?',
          [amount, phone]
      );

       console.log("win amount",amount,"haahah")

      if (result.affectedRows > 0) {
          console.log(`✅ Successfully added ${amount} winnings to ${phone}`);
          // Optional: Fetch new balance if needed elsewhere
          // const [updatedUser] = await connection.execute('SELECT money, win_wallet FROM users WHERE phone = ?', [phone]);
          // return { status: true, wallet: updatedUser[0].money + updatedUser[0].win_wallet };
          return { status: true };
      } else {
          console.warn(`⚠️ Failed to add winnings for phone: ${phone}. User not found or update failed.`);
          return { status: false, error: "User not found or update failed" };
      }
  } catch (error) {
      console.error(`❌ Database error adding winnings for phone ${phone}:`, error);
      return { status: false, error: "Database error while adding winnings" };
  }
}

const adminPageDragon = async (req,res)=>{
  return res.render('manage/dragon.ejs')
}

module.exports = { Dragon,userDekh,reduceWallet,addWinnings,adminPageDragon };
