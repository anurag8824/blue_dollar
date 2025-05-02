import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookTicket } from "../api";
import axios  from 'axios'

import "./LotteryPage.css"

const bigLotteryTickets = [
  { price: 500, label: "LUCKY PRICE 1 LAC", image: "/images/notes/500.png" },
  { price: 251, label: "LUCKY PRICE 50,000", image: "/images/notes/251.png" },
  { price: 151, label: "LUCKY PRICE 21,000", image: "/images/notes/151.png" },
  { price: 100, label: "LUCKY PRICE 11,000", image: "/images/notes/100.png" },
  { price: 51, label: "LUCKY PRICE 5,100", image: "/images/notes/51.png" },
];

const smallLotteryPrices = [10, 20, 50, 100, 151, 251, 500, 1000];

const LotteryPage = () => {
  const [inputs, setInputs] = useState({});
  const [islottery,setIslottey] = useState(false)
  const [roundId,setRoundId] = useState(null)
  const navigate = useNavigate();

  const handleChange = (e, key) => {
    const { value } = e.target;
    setInputs((prev) => ({ ...prev, [key]: value }));
  };
  useEffect(() => {
    async function fetch() {
      try {
        const response = await axios.get("https://bluedoller.online/check-lottery");
        console.log(response, "response");
  
        const latestLottery = response.data.latestLottery;
  
        if (latestLottery && latestLottery.status === 1) {
          setIslottey(true);
          setRoundId(latestLottery?.round_id);
        }
  
      } catch (error) {
        console.log("Error in fetching lottery:", error);
      }
    }
  
    fetch();
  }, []);
  
  const isInputValid = (value, min, max) => {
    return value >= min && value <= max;
  };

  const handlePurchase = async (number, price, type) => {
    if (!number) {
      alert("कृपया नंबर डालें");
      return;
    }

    if(!islottery){
      alert("Lottery is Closed Now ! Please Try between 9.30 AM to 3.30 PM")
      return
    }

    try {
      const response = await bookTicket({
        number,
        price,
        type,
        roundId
      });
      console.log(response ,"hjkl;hjkl")
      if (response.status ===200 || response.status === 234) {
        alert(`आपका टिकट (${number}) सफलतापूर्वक बुक हो गया है!`);
        navigate("/history");
      } else if(response.status === 205){
        window.location.href = "/login"
      }
      
      else {
        alert("कुछ गलत हुआ, कृपया पुनः प्रयास करें");
      }
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      alert("सर्वर त्रुटि! कृपया बाद में पुनः प्रयास करें");
    }
  };

  return (


    <><header className="game-header">
      <div className="header-content md:text-base text-xs md:justify-between justify-center text-gray-900 ">
        <input
          type="text"
          value={`Round ID: 1245789`}
          disabled
          className="round-id-input" />
        <div className="date-tim text-nowrap  round-id-input">
          <span>{new Date().toLocaleDateString()}</span>-
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </header>
    <div className="min-h-screen py-8 px-4 md:px-12" style={{ background: "linear-gradient(90deg,rgba(0, 74, 171, 1) 0%, rgba(0, 0, 0, 1) 0%, rgba(0, 74, 171, 1) 100%)" }}>
    
    <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl md:text-2xl font-bold drop-shadow-[0_0_4px_red] text-yellow-300">प्रत्येक रविवार <br /> LUCKY DRAW</h2>
          </div>
          {/* <img src="/images/topbanner.webp"
    alt="Lottery Banner" className="w-full rounded-md shadow-slate-800 shadow-2xl max-w-2xl mx-auto" /> */}

          <div className="relative w-full max-w-2xl mx-auto">
            <img src="/images/topbanner.webp"
              alt="Lottery Banner"
              className="w-full rounded-md shadow-slate-800 shadow-2xl" />
            <span className="glow-dot"></span>
          </div>

          <div className="text-center md:text-right mt-4 md:mt-0">
            <h2 className="text-xl md:text-2xl font-bold drop-shadow-[0_0_4px_red] text-yellow-300">प्रत्येक रविवार <br /> LUCKY DRAW</h2>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">LOTTERY</h1>
          <h2 className="text-lg font-semibold text-yellow-300">5 LUCKY WINNER</h2>
          <div className="ribbon-banner">
            <p className="ribbon-text">
              अब हर week 1 लाख रुपये जीतने का मौका <br />
              <span className="ribbon-highlight">
                "हर हफ्ते मौके हैं अपनी किस्मत का चमकाने का - लकी ड्रॉ में हिस्सा लें और सपनों को सच करें!"
              </span>
            </p>
          </div>

        </div>



        <div className="lottery-info-container ">
          <p className="lottery-main-banner ribbon-banner">
            रोज लाटरी खरीदें और पाइये LOTTERY PRICE का 20 गुना
          </p>

          <div className="lottery-time-box">
            <div>
            <p className="lottery-label ">
  प्रत्येक सोमवार से शनिवार Lucky Draw ticket खरीदने का समय
</p>              <p className="lottery-time text-red-500 drop-shadow-[0_0_4px_red]">24 hours anytime</p>
            </div>
            <div>
              <p className="lottery-label">प्रत्येक रविवार को Lucky Draw खुलने का समय</p>
              <p className="lottery-time text-red-500 drop-shadow-[0_0_4px_red]"> प्रातः - 10:15 to 12:15</p>
            </div>
          </div>
        </div>

        {/* BIG LOTTERY NUMBERS */}
        <h2 className="text-xl font-bold text-white mt-6 mb-2">Big Lottery Tickets</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {bigLotteryTickets.map((item, index) => (
            <div key={index} style={{ borderColor: "#736ced" }} className="p-4 relative md:border rounded-md  flex flex-col items-center">
              {/* <img src={item.image} alt={`${item.price} Rs`} className="w-full object-cover mb-2" style={{ maxHeight: "300px" }} /> */}
              <div className="relative image-glow-wrapper">
                <img
                  src={item.image}
                  alt={`${item.price} Rs`}
                  className="w-full object-cover  image-glow"
                  style={{ maxHeight: "300px" }} />
                <div className="image-glow-overlay"></div>
              </div>
              <p className="text-white font-semibold mb-2">{item.label}</p>
              <div className="lottery-card">
              <input
                  type="number"
                  min="501"
                  max="2500"
                  value={inputs[`big-${index}`] || ""}
                  onChange={(e) => handleChange(e, `big-${index}`)}
                  placeholder="Number चुनें 501-1500"
                  className="lottery-input" />
                <button
                  disabled={!isInputValid(inputs[`big-${index}`], 501, 2500)}
                  onClick={() => handlePurchase(inputs[`big-${index}`], item.price, "big")}
                  className={`lottery-btn ${isInputValid(inputs[`big-${index}`], 501, 2500)
                      ? "lottery-btn-active"
                      : "lottery-btn-disabled"}`}
                >
                  BUY YOUR LOTTERY NUMBER
                </button>
               
              </div>
            </div>
          ))}
        </div>


        <div className="lottery-info-container">
          <p className="lottery-main-banner">
            रोज लाटरी खरीदें और पाइये LOTTERY PRICE का 20 गुना
          </p>

          <div className="lottery-time-box">
            <div>
              <p className="lottery-label">LOTTERY खरीदने का TIME</p>
              <p className="lottery-time text-red-500 drop-shadow-[0_0_4px_red]">प्रातः - 10:15 to 03:15</p>
            </div>
            <div>
              <p className="lottery-label">LOTTERY खुलने का TIME</p>
              <p className="lottery-time text-red-500 drop-shadow-[0_0_4px_red]">सायं - 06:15</p>
            </div>
          </div>
        </div>



       

        {/* SMALL LOTTERY NUMBERS */}
        <h2 className="text-xl font-bold text-white mb-2 mt-8">Small Lottery Tickets</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {smallLotteryPrices.map((price, index) => (
            <div key={`small-${index}`} style={{ borderColor: "#736ced" }} className="p-4 flex md:border rounded-md flex-col items-center">
              <img
                src={`/images/coins/${price}.png`}
                alt={`Coin ${price} Rs`}
                className="w-24 h-24 object-cover rounded-full hover:animate-spin shadow-md mb-2" />
              <p className="text-white font-semibold mb-4">LOTTERY TICKET</p>
              <div className="lottery-card">
              <input
                  type="number"
                  min="1"
                  max="500"
                  value={inputs[`small-${index}`] || ""}
                  onChange={(e) => handleChange(e, `small-${index}`)}
                  placeholder="Number चुनें 1-500"
                  className="lottery-input" />
                <button
                  disabled={!isInputValid(inputs[`small-${index}`], 1, 500)}
                  onClick={() => handlePurchase(inputs[`small-${index}`], price, "small")}
                  className={`lottery-btn ${isInputValid(inputs[`small-${index}`], 1, 500) ? "lottery-btn-active" : "lottery-btn-disabled"}`}
                >
                  BUY YOUR LOTTERY NUMBER
                </button>
               
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
     
      </div></>
  );
};

export default LotteryPage;
