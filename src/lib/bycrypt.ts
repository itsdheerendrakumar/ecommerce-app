import "server-only";
import bcrypt from "bcryptjs";

export async function hashPassword(passward: string): Promise<string> {
    const salt = process.env.SALT ?? "10";
    const hashedPassword = await bcrypt.hash(passward, parseInt(salt));
    return hashedPassword;
}

export async function comparePassword(hashedPassword: string, password: string): Promise<boolean> {
    console.log({password, hashPassword})
    const isMatched = await bcrypt.compare(password, hashedPassword);
    return isMatched
}