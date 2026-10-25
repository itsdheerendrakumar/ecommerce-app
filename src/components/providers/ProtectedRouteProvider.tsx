"use client"

import { useMe } from "@/hooks/useMe";
import { getProfile } from "@/lib/client-api/auth";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";

export function ProtectedRouteProvider({children}: {children: ReactNode}) {
    const { profileQuery } = useMe();

    if(profileQuery.isLoading) return <div>Loading</div>

    if(profileQuery.isSuccess) return children;
}