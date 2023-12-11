import { UserResponse } from "@/server/api/web/entities/user.js";

export type AuthResponse = {
    status: 'guest' | 'authenticated' | '2fa';
	token: string | null;
    user: UserResponse | null;
}

export type AuthRequest = {
    username: string;
    password: string;
}
