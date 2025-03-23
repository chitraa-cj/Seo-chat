import jwt from 'jsonwebtoken';
interface User {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
}
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePasswords: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (user: User) => string;
export declare const verifyToken: (token: string) => string | jwt.JwtPayload;
export {};
//# sourceMappingURL=auth.d.ts.map