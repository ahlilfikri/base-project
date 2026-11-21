import axios from "axios";
import { NEXT_PUBLIC_API_URL } from "@/constant/env";

const REQUEST_TIMEOUT_MS = 10_000;

export const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});
