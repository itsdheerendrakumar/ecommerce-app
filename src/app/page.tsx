import Home from "@/app/components/Home";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { verifyToken } from "@/lib/jsonwebtoken";
import { redirect } from "next/navigation";

export default async function Page() {
  await connection();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  let session = accessToken ? verifyToken(accessToken) : false;
  if (!session && refreshToken) {
    session = verifyToken(refreshToken);
  }
  if (session && session.data?.role === "admin") {
    redirect("/admin/dashboard");
  }
  return <Home />;
}
