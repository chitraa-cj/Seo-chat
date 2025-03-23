export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  }

  async register(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'Registration failed');
    }

    return responseData;
  }
} 