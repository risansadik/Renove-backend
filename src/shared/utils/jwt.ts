import jwt from 'jsonwebtoken'
import { AUTH_CONFIG, type Role } from '../constants';
import type { Response ,CookieOptions} from 'express';

interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  iat ?: number;
  exp ?: number;
}

export const generateTokens = (
  payload: TokenPayload
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(payload, AUTH_CONFIG.ACCESS_TOKEN.SECRET, {
    expiresIn: AUTH_CONFIG.ACCESS_TOKEN.EXPIRY as jwt.SignOptions["expiresIn"],
  });

  const refreshToken = jwt.sign(payload, AUTH_CONFIG.REFRESH_TOKEN.SECRET, {
    expiresIn: AUTH_CONFIG.REFRESH_TOKEN.EXPIRY as jwt.SignOptions["expiresIn"],
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, AUTH_CONFIG.ACCESS_TOKEN.SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, AUTH_CONFIG.REFRESH_TOKEN.SECRET) as TokenPayload;
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions:CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: AUTH_CONFIG.ACCESS_TOKEN.MAX_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: AUTH_CONFIG.REFRESH_TOKEN.MAX_AGE,

  });
};

export const clearAuthCookies = (res:Response): void => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

