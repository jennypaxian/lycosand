import { UserResponse } from "@/server/api/web/entities/user.js";

export type AuthResponse = {
    authenticated: boolean;
    user: UserResponse | null;
}
