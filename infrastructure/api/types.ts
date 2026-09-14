export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiStub {
  method: HttpMethod;
  endpoint: string;
  status: number;
  body: unknown;
  delayMs?: number;
}

export interface ApiProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: "admin" | "consumer" | "provider";
  calendar_connection_status: "disconnected" | "connected" | "action_required";
}
