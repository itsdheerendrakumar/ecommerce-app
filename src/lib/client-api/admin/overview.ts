import instance from "../axios";
import type { AdminOverviewData, OverviewRange } from "@/types/admin-overview";

export * from "@/types/admin-overview";

export interface GetAdminOverviewResponse {
  message: string;
  data?: {
    data: AdminOverviewData;
  };
}

export async function getAdminOverviewApi(
  range: OverviewRange = "30d"
): Promise<GetAdminOverviewResponse> {
  const response = await instance.get<GetAdminOverviewResponse>(
    `/admin/overview?range=${range}`
  );
  return response.data;
}
