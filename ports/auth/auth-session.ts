export interface AuthSession {
  getAccessToken(): Promise<string>;
}
