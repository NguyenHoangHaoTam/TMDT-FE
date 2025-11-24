import DashboardManageKeys from "@/service/admin/dashboard/endpoint";
import {
  getAreaOrderChart,
  getAreaUserChart,
  getPieOrderChart,
  getRevenueChart,
  getTopCategory,
  getTopProduct,
} from "@/service/admin/dashboard/service";
import { useQuery } from "@tanstack/react-query";

export function useManageDashboard(body: { fromDate: string; toDate: string }) {
  const { data: revenueChart, isPending: isPendingRevenue } = useQuery({
    queryKey: [DashboardManageKeys.REVENUE_CHART, body],
    queryFn: () => getRevenueChart(body),
  });
  const { data: dataPieOrderChart, isPending: isPendingPie } = useQuery({
    queryKey: [DashboardManageKeys.PIE_ORDER_CHART, body],
    queryFn: () => getPieOrderChart(body),
  });
  const { data: dataAreaUserChart, isPending: isPendingAreUser } = useQuery({
    queryKey: [DashboardManageKeys.AREA_USER_CHART, body],
    queryFn: () => getAreaUserChart(body),
  });
  const { data: dataAreaOrderChart, isPending: isPendingAreOrder } = useQuery({
    queryKey: [DashboardManageKeys.AREA_ORDER_CHART, body],
    queryFn: () => getAreaOrderChart(body),
  });
  const { data: dataTopProduct, isPending: isPendingTopProduct } = useQuery({
    queryKey: [DashboardManageKeys.TOP_PRODUCT],
    queryFn: () => getTopProduct(),
  });
  const { data: dataTopCategory, isPending: isPendingTopCategory } = useQuery({
    queryKey: [DashboardManageKeys.TOP_CATEGORY],
    queryFn: () => getTopCategory(),
  });

  return {
    revenueChart,
    dataPieOrderChart,
    dataAreaUserChart,
    dataAreaOrderChart,
    dataTopProduct,
    dataTopCategory,
    isPendingTopCategory,
    isPendingTopProduct,
    isPending:
      isPendingRevenue && isPendingPie && isPendingAreUser && isPendingAreOrder,
  };
}
