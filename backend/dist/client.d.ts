export interface User {
    id: string;
    email: string;
    name: string;
}
export interface AuthResponse {
    user: User;
    token: string;
}
export declare class AuthClient {
    private baseUrl;
    constructor(baseUrl: string);
    login(credentials: {
        email: string;
        password: string;
    }): Promise<AuthResponse>;
    register(data: {
        email: string;
        password: string;
        name: string;
    }): Promise<AuthResponse>;
}
//# sourceMappingURL=client.d.ts.map