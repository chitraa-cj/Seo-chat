declare module 'seo-chatbot-auth-api' {
  interface User {
    id: string;
    email: string;
    name: string;
  }

  interface AuthResponse {
    user: User;
    token: string;
  }

  export class AuthClient {
    constructor(baseUrl: string);
    login(credentials: { email: string; password: string }): Promise<AuthResponse>;
    register(data: { email: string; password: string; name: string }): Promise<AuthResponse>;
  }
} 