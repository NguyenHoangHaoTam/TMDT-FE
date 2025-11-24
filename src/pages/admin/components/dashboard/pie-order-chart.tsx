import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { OrdersStatus } from "@/service/admin/dashboard/service";
import { Skeleton } from "@/components/ui/skeleton";

export const description = "A donut chart";

const chartConfig = {
  completed: {
    label: "Completed Orders",
    color: "var(--chart-1)",
  },
  paid: {
    label: "Paid Orders",
    color: "var(--chart-2)",
  },
  pending: {
    label: "Pending Orders",
    color: "var(--chart-3)",
  },
  shipped: {
    label: "Shipped Orders",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ChartPieOrder({
  data,
  isPending,
}: {
  data?: OrdersStatus;
  isPending: boolean;
}) {
  const chartData = [
    {
      key: "completed",
      visitors: data?.summary?.ordersStatus?.completedOrders ?? 0,
      fill: "var(--color-completed)",
    },
    {
      key: "paid",
      visitors: data?.summary?.ordersStatus?.paidOrders ?? 0,
      fill: "var(--color-paid)",
    },
    {
      key: "pending",
      visitors: data?.summary?.ordersStatus?.pendingOrders ?? 0,
      fill: "var(--color-pending)",
    },
    {
      key: "shipped",
      visitors: data?.summary?.ordersStatus?.shippedOrders ?? 0,
      fill: "var(--color-shipped)",
    },
  ];

  const isEmpty = chartData.every((item) => item.visitors === 0);

  return (
    <Card className="flex flex-col pb-0 gap-0 h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex gap-2">
          <div className="h-4 w-1 rounded-2xl bg-green-600"></div>
          <span>Trạng thái đơn hàng</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center px-0 pb-0">
        {isPending && (
          <Skeleton className="w-[200px] h-[200px] rounded-full bg-slate-200 animate-pulse" />
        )}

        {!isPending && isEmpty && (
          <div className="text-sm text-slate-500">Không có dữ liệu</div>
        )}
        {!isPending && !isEmpty && (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-full max-h-[250px] min-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="key"
                innerRadius={40}
              />
              <ChartLegend
                content={
                  <ChartLegendContent
                    className="flex flex-wrap"
                    nameKey="key"
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
