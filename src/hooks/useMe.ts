import { getProfile } from "@/lib/client-api/auth";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-key";

export function useMe() {
    const profileQuery = useQuery({
        queryKey: [queryKeys.me],
        queryFn: getProfile
    });
    const user = profileQuery.data?.user ?? profileQuery.data?.data?.data ?? null;
    return { profileQuery, user };
}
