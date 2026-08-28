import { jwtDecode } from "jwt-decode";
import type { CustomerJWTPayload } from "@/types/auth.types";

// TODO: Re-verify CustomerJWTPayload shape against the backend if the token
// structure ever changes — this was confirmed from a single decoded sample
// during backend QA, not generated from a shared backend type.
export function decodeCustomerJWT(token: string): CustomerJWTPayload | null {
  try {
    return jwtDecode<CustomerJWTPayload>(token);
  } catch {
    return null;
  }
}
