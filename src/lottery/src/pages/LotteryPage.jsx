import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookTicket } from "../api";
import axios from "axios";

import "./LotteryPage.css";

const bigLotteryTickets = [
  { price: 500, label: "LUCKY PRICE 1 LAC", image: "/lottery/images/notes/500.png" },
  { price: 251, label: "LUCKY PRICE 50,000", image: "/lottery/images/notes/251.png" },
  { price: 151, label: "LUCKY PRICE 21,000", image: "/lottery/images/notes/151.png" },
  { price: 100, label: "LUCKY PRICE 11,000", image: "/lottery/images/notes/100.png" },
  { price: 51, label: "LUCKY PRICE 5,100", image: "/lottery/images/notes/51.png" },
];

const smallLotteryPrices = [10, 20, 50, 100, 151, 251, 500, 1000];

const LotteryPage = () => {
  const [inputs, setInputs] = useState({});
  const [issmlottery, setIssmlottey] = useState(false);
  const [isbilottery, setIsbilottey] = useState(false);

  const [roundId, setRoundId] = useState(null);
  const [broundId, setbRoundId] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e, key) => {
    const { value } = e.target;
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const [showPopup, setShowPopup] = useState(true);

  const handleClose = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    async function fetch() {
      try {
        const response = await axios.get("https://bluedoller.online/check-lottery");
        const latestLottery = response.data;
        console.log("Fetched Lotteries:", latestLottery);
  
        latestLottery.forEach((lottery) => {
          if (lottery.status === 1 && lottery.type === "small") {
            setIssmlottey(true);
            setRoundId(lottery.round_id);
          }
  
          if (lottery.status === 1 && lottery.type === "big") {
            setIsbilottey(true);
            setbRoundId(lottery.round_id);
          }
        });
      } catch (error) {
        console.log("Error in fetching lottery:", error);
      }
    }
  
    fetch();
  }, []);

  const [userData, setUserData] = useState(0);
  useEffect(() => {
    axios
      .get("https://bluedoller.online/api/webapi/GetUserInfo")
      .then((res) => {
        console.log(res, "user info");
        setUserData(res?.data?.data?.money_user + res?.data?.data?.win_wallet);
      
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const isInputValid = (value, min, max) => {
    return value >= min && value <= max;
  };

  const handlePurchase = async (number, price, type) => {
    if (!number) {
      alert("कृपया नंबर डालें");
      return;
    }

    if (type == "small" && ! issmlottery) {
      alert("Lottery is Closed Now ! Please Try between 9.30 AM to 3.30 PM");
      return;
    }

    if (type == "big" && !isbilottery) {
      alert("Lottery is Closed Now ! Please Buy on Monday !");
      return;
    }


    if (userData < price) {
      alert("Blance is too low ! ");
      return;
    }
    let betRoundId = null;
    if(type == "small"){
      betRoundId = roundId
    }else{
      betRoundId = broundId
    }

    try {
      const response = await bookTicket({
        number,
        price,
        type,
        betRoundId,
      });
      console.log(response, "hjkl;hjkl");
      if (response.status === 200  && response.data.isStatus == true) {
        alert(`आपका टिकट (${number}) सफलतापूर्वक बुक हो गया है!`);
        setUserData(userData - price);
        // navigate("/history");
      } else if (response.status === 205) {
        window.location.href = "/login";
      } else {
        alert("कुछ गलत हुआ, कृपया पुनः प्रयास करें");
      }
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      alert("सर्वर त्रुटि! कृपया बाद में पुनः प्रयास करें");
    }
  };

  return (
    <div>
      <header className="game-header ">
        <div className="header-content md:text-base text-xs md:justify-between justify-center text-gray-900 ">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            title="Go Back"
          >
        <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-6 h-6 text-black"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth={3}  // <— made bolder
>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
</svg>

          </button>    
          {/* <i class="fa-solid fa-angle-left" onclick={() => window.history.back()} style={{color:"black"}}></i> */}
         <div className="flex items-center gap-2">

      

          <input
            type="text"
            value={`ROUND Id ${roundId || broundId ? roundId+broundId  : "-"}`}
            disabled
            className="round-id-input text-xs"
          />

     <div className="date-tim text-nowrap  text-xs round-id-input">
            <span>₹{userData || 0}</span>
            {/* <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> */}
          </div>
          </div>
         
        </div>
      </header>
      <div
        className="min-h-screen py-8 px-4 md:px-12"
        style={{
          background:
            "linear-gradient(90deg,rgba(0, 74, 171, 1) 0%, rgba(0, 0, 0, 1) 0%, rgba(0, 74, 171, 1) 100%)",
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl md:text-2xl font-bold drop-shadow-[0_0_4px_red] text-yellow-300">
              प्रत्येक रविवार <br /> LUCKY DRAW
            </h2>
          </div>
          {/* <img src="/images/topbanner.webp"
    alt="Lottery Banner" className="w-full rounded-md shadow-slate-800 shadow-2xl max-w-2xl mx-auto" /> */}

          <div className="relative w-full max-w-2xl mx-auto">
            <img
              src="/images/topbannner.png"
              alt="Lottery Banner"
              className="w-full rounded-md shadow-slate-800 shadow-2xl"
            />
            <span className="glow-dot"></span>
          </div>

          <div className="text-center md:text-right mt-4 md:mt-0">
            <h2 className="text-xl md:text-2xl font-bold drop-shadow-[0_0_4px_red] text-yellow-300">
              प्रत्येक रविवार <br /> LUCKY DRAW
            </h2>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center space-y-6 mt-10">
            {/* Spinning Wheel */}

            {/* Headings */}
            <h1 className="text-6xl flex items-center font-extrabold text-white drop-shadow-lg ">
              L
              <span>
                {" "}
                <div className="relative w-14 h-14 animate-spin rounded-full border-8 border-yellow-400 border-t-red-500 border-b-blue-700 border-r-green-600 animate-spin-slow shadow-lg"></div>
              </span>
              TTERY
            </h1>
            <h2 className="text-3xl font-bold text-yellow-400 drop-shadow-md animate-bounce">
              5 LUCKY WINNERS
            </h2>
          </div>
          <div className="ribbon-banner">
            <img
              src="/images/jkjk.png"
              alt="Lottery Banner"
              className="w-full rounded-md shadow-slate-800 shadow-2xl"
            />
          </div>
        </div>

        <div className="lottery-info-container ">
          <img
            src="/images/1.png"
            alt="Lottery Banner"
            className="w-full rounded-md shadow-slate-800 shadow-2xl"
          />
        </div>

        {/* BIG LOTTERY NUMBERS */}
        <h2 className="text-xl font-bold text-white mt-6 mb-2">
          Big Lottery Tickets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {bigLotteryTickets.map((item, index) => (
            <div
              key={index}
              style={{ borderColor: "#736ced" }}
              className="p-4 relative md:border rounded-md  flex flex-col items-center"
            >
              {/* <img src={item.image} alt={`${item.price} Rs`} className="w-full object-cover mb-2" style={{ maxHeight: "300px" }} /> */}
              <div className="relative image-glow-wrapper">
                <img
                  src={"/lottery" + item.image}
                  alt={`${item.price} Rs`}
                  className="w-full object-cover  image-glow"
                  style={{ maxHeight: "300px" }}
                />
                <div className="image-glow-overlay"></div>
              </div>
              <p className="text-white font-semibold mb-2">{item.label}</p>
              <div className="lottery-card">
                <input
                  type="number"
                  min="501"
                  max="1500"
                  value={inputs[`big-${index}`] || ""}
                  onChange={(e) => handleChange(e, `big-${index}`)}
                  placeholder="Number चुनें 501-1500"
                  className="lottery-input"
                />
                <button
                  disabled={!isInputValid(inputs[`big-${index}`], 501, 1500)}
                  onClick={() =>
                    handlePurchase(inputs[`big-${index}`], item.price, "big")
                  }
                  className={`lottery-btn ${
                    isInputValid(inputs[`big-${index}`], 501, 1500)
                      ? "lottery-btn-active"
                      : "lottery-btn-disabled"
                  }`}
                >
                  BUY YOUR LOTTERY NUMBER
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lottery-info-container">
          <img
            src="/images/2.png"
            alt="Lottery Banner"
            className="w-full rounded-md shadow-slate-800 shadow-2xl"
          />
        </div>

        {/* SMALL LOTTERY NUMBERS */}
        <h2 className="text-xl font-bold text-white mb-2 mt-8">
          Small Lottery Tickets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {smallLotteryPrices.map((price, index) => (
            <div
              key={`small-${index}`}
              style={{ borderColor: "#736ced" }}
              className="p-4 flex md:border rounded-md flex-col items-center"
            >
              <img
                src={`/images/coins/${price}.png`}
                alt={`Coin ${price} Rs`}
                className="w-24 h-24 object-cover rounded-full hover:animate-spin shadow-md mb-2"
              />
              <p className="text-white font-semibold mb-4">LOTTERY TICKET</p>
              <div className="lottery-card">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={inputs[`small-${index}`] || ""}
                  onChange={(e) => handleChange(e, `small-${index}`)}
                  placeholder="Number चुनें 1-500"
                  className="lottery-input"
                />
                <button
                  disabled={!isInputValid(inputs[`small-${index}`], 1, 500)}
                  onClick={() =>
                    handlePurchase(inputs[`small-${index}`], price, "small")
                  }
                  className={`lottery-btn ${
                    isInputValid(inputs[`small-${index}`], 1, 500)
                      ? "lottery-btn-active"
                      : "lottery-btn-disabled"
                  }`}
                >
                  BUY YOUR LOTTERY NUMBER
                </button>

               
              </div>
              {/* <p className="text-white text-sm mt-2">10 winners in every lottery</p> */}
              <p className="text-white text-sm mt-2 font-semibold text-center tracking-wide bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
  🎉 10 Winners in Every Lottery! 🎉
</p>

            </div>
          ))}
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default LotteryPage;
