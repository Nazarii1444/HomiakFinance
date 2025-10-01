export interface User {
    id_: number;
    username: string;
    email: string;
    default_currency: string;
    timezone: string | null;
    capital: number;
    role: number;
}

export interface UserUpdateData {
    username?: string;
    email?: string;
    default_currency?: string;
    timezone?: string;
}