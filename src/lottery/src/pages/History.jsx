import { useEffect, useState } from "react";
import { getFinalResult, getTickets, getWinners } from "../../src/api";

export default function History() {
  const [tickets, setTickets] = useState([]);
  const [winners, setWinners] = useState([]);

  const getLotteryTypeLabel = (type) => {
    if (type === "small") return "Small Lottery Number";
    if (type === "big") return "Big Lottery Number";
    return "Unknown Type";
  };

  const [filteredResults, setFilteredResults] = useState([]);


  useEffect(() => {
    // Fetch tickets
    getTickets().then(({ data }) => {

      console.log(data,"historyn datta is here")
      const sortedTickets = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sortedTickets);
    });

    // Fetch winners
    getFinalResult().then(({ data }) => {
      console.log(data.data,"winnerss finalll")
      const fdata = data.data
      console.log(fdata,"f data finalll")
      setFilteredResults(fdata)
     

      // const sortedWinners = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // setWinners(sortedWinners);
    });
  }, []);

  // ✅ Step 1: Get the latest winner for each type
  const latestWinners = {};
  winners.forEach((winner) => {
    const existing = latestWinners[winner.type];
    if (!existing || new Date(winner.createdAt) > new Date(existing.createdAt)) {
      latestWinners[winner.type] = winner;
    }
  });

   console.log(filteredResults,"filtered result")

   const formatDate2 = (roundId) => {
    if (!roundId || typeof roundId !== 'string') return '';
  
    const datePart = roundId.split('-')[0]; // e.g., "20250504"
    if (datePart.length !== 8) return '';
  
    const year = datePart.slice(0, 4);
    const month = datePart.slice(4, 6);
    const day = datePart.slice(6, 8);
  
    return `${day}-${month}-${year}`; // e.g., "04-05-2025"
  };

  return (
    <div className="min-h-screen p-2 bg-gradient-to-b from-red-600 to-red-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <h2 className="text-3xl font-bold mb-10 text-white text-center">
        Your Tickets & Winners History
      </h2>

      {/* Tickets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {tickets.map((ticket) => {
          const ticketTime = new Date(ticket.createdAt);
          const winner = latestWinners[ticket.type];

          
          let resultStatus = "pending";

          // if (winner) {
          //   const winnerTime = new Date(winner.createdAt);
          //   const ticketTime = new Date(ticket.createdAt);
          
          //   if (ticketTime <= winnerTime) {
          //     if (ticket.number === winner.number) {
          //       resultStatus = "won";
          //     } else {
          //       resultStatus = "lost";
          //     }
          //   } else {
          //     resultStatus = "pending"; // Ticket was placed after result
          //   }
          // }
          
          function formatDate(roundId) {
            const datePart = roundId.split('-')[0]; // "20250504"
            const year = datePart.slice(0, 4);
            const month = datePart.slice(4, 6);
            const day = datePart.slice(6, 8);
            return `${day}-${month}-${year}`; // "04-05-2025"
          }

          return (
            <div
              key={ticket._id}
              className={`p-6 rounded-2xl shadow-lg transition-all ${
                resultStatus === "won"
                  ? "bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-100"
                  : resultStatus === "lost"
                  ? "bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100"
                  : "bg-gradient-to-r from-gray-100 to-gray-50"
              } hover:scale-105 transform duration-200 ease-in-out`}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="font-semibold text-gray-700">Number:</span> {ticket.number}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Price:</span> ₹{ticket.price}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-700">Type:</span> {getLotteryTypeLabel(ticket.type)}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-700">Date:</span> {formatDate(ticket.roundId)}
              </div>
              </div>


              {/* Result Status */}
              {resultStatus === "pending" ? (
                <div className="flex justify-center items-center text-gray-700 text-xl font-bold mb-2">
                  ⏳ Result {ticket.result}
                </div>
              ) : resultStatus === "won" ? (
                <div className="flex justify-center items-center text-green-600 text-xl font-bold mb-2">
                 ⏳ Result {ticket.result}
                </div>
              ) : (
                <div className="flex justify-center items-center text-red-600 text-xl font-bold mb-2">
                  ⏳ Result {ticket.result}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Winners Section */}
      <h2 className="text-3xl font-bold mb-6 text-white text-center">Winners</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {winners.map((ticket, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl shadow-lg bg-gradient-to-r from-green-300 via-green-200 to-green-100 hover:scale-105 transform duration-200 ease-in-out"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="font-semibold text-gray-700">Number:</span> {ticket.number}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Type:</span> {getLotteryTypeLabel(ticket.type)}
              </div>
            </div>
            <div className="flex justify-center items-center text-green-700 text-xl font-bold">
              🏆 Winner!
            </div>
          </div>
        ))}
      </div>


     


      <div className="">
      <h2 className="text-2xl font-bold text-center mb-6">🎯 Declared Lottery Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults?.map((item, index ) => (
          <div key={index} className="bg-white rounded-2xl shadow-md p-4">
            <h3 className="text-base font-semibold mb-3">Dated-{formatDate2(item.round_id)}</h3>
            <div className="grid flex-wrap gap-2">
              {item?.data?.map((num, idx) => {
                const key = Object.keys(num)[0]
                const value = num[key]
                return (
                <span
                  key={idx}
                  className="bg-green-600 text-white px-1 py-1 rounded-md text-xs"
                >
                 {key} - {value}
                </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
