import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

export const aiApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AI_ENGINE_URL,
  timeout: 30000,
});
