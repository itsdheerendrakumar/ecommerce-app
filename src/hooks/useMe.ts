import { getProfile } from "@/lib/client-api/auth";
import { useQuery } from "@tanstack/react-query";

export function useMe() {
    const profileQuery = useQuery({
        queryKey: ["me"],
        queryFn: getProfile
    });
    const user = profileQuery.data?.user ?? profileQuery.data?.data?.data ?? null;
    return { profileQuery, user };
}