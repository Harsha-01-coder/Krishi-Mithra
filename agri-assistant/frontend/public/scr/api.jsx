import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

export const getWeather = (city, days) => axios.get(`${API_URL}/weather?city=${city}&days=${days}`);
export const checkSoil = (data) => axios.post(`${API_URL}/soil`, data);
