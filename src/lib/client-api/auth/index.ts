import instance from "../axios";
import type {
  SignupPayload,
  LoginPayload,
  SignupResponse,
  LoginResponse,
  ProfileResponse,
} from "./types";

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  const response = await instance.post<SignupResponse>("/signup", payload);
  return response.data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await instance.post<LoginResponse>("/login", payload);
  return response.data;
}

export async function getProfile(): Promise<ProfileResponse> {
  const response = await instance.get<ProfileResponse>("/me");
  return response.data;
}

export async function logout() {
  const response = await instance.post("/logout", {});
  return response.data;
}
