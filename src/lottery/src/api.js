import axios from "axios";

const API = axios.create({ baseURL: "https://bluedoller.online" });
// const API = axios.create({ baseURL: "http://localhost:3000" });


export const bookTicket = (ticket) => API.post("/lottery/buy", ticket,{ withCredentials: true });
export const getTickets = () => API.get("/lottery/history-one",{ withCredentials: true });
export const announceWinners = (data) => API.post("/admin/announce", data);
// export const getWinners = () => API.get("/tickets/check-winners");
export const getFinalResult = () => API.get("/lottery/full-result", { withCredentials: true });


// /lottery/set-result

export default API;
