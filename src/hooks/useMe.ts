import { getProfile } from "@/lib/client-api/auth";
import { useQuery } from "@tanstack/react-query";

export function useMe() {
    const profileQuery = useQuery({
        queryKey: ["me"],
        queryFn: getProfile
    });
    return { profileQuery }
}