import "server-only";
import jwt from "jsonwebtoken";
const acessTokenExpiry = process.env.ACCESS_TOEKEN_EXPIRY
const refreshTokenExpiry = process.env.REFRESH_TOEKEN_EXPIRY
const jwtSecret = process.env.JWT_SECRET ?? ""

export interface JwtUserPayload {
    _id: unknown;
    role?: string;
    [key: string]: unknown;
}

export interface DecodedTokenPayload extends jwt.JwtPayload {
    data: {
        _id: string;
        role?: string;
        [key: string]: unknown;
    };
}

export function generateJwtToken(payload: JwtUserPayload, type: "accessToken" | "refreshToken", rememberMe?: boolean): string {
    console.log({acessTokenExpiry, refreshTokenExpiry, jwtSecret})
    const token = jwt.sign({
        data: {_id: payload._id, role: payload.role}},
        jwtSecret,
        {expiresIn: (type === "accessToken" ? acessTokenExpiry : (rememberMe ? refreshTokenExpiry : "30m")) as jwt.SignOptions["expiresIn"]}
    )
    return token
}

export function verifyToken(token: string): DecodedTokenPayload | false {
    try {
        const decoded = jwt.verify(token, jwtSecret) as DecodedTokenPayload;
        return decoded
    } catch (_) {
        return false
    }
}