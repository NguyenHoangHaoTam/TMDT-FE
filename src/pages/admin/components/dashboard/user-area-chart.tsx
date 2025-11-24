import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { NewUserByDate } from "@/service/admin/dashboard/service";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const description = "A simple area chart";

const chartConfig = {
  newUsers: {
    label: "newUsers",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartAreaUser({
  data,
  isPending,
}: {
  data?: NewUserByDate[];
  isPending?: boolean;
}) {
  const isEmpty = !data || data.length === 0;

  return (
    <Card className="bg-background pb-0">
      <CardHeader>
        <CardTitle className="flex gap-2">
          <div className="h-4 w-1 rounded-2xl bg-pink-500" />
          <span>Khách hàng mới</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {isPending ? (
          <div className="flex justify-center items-center h-[200px] w-full">
            <Skeleton className="w-full h-full rounded-md bg-slate-200 animate-pulse" />
          </div>
        ) : isEmpty ? (
          <div className="flex justify-center items-center h-[200px] text-slate-400 text-sm">
            Không có dữ liệu
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-video p-6 h-[200px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" hide />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => format(value, "dd/MM/yyyy")}
                  />
                }
              />

              <Area
                dataKey="newUsers"
                type="natural"
                fill="var(--color-newUsers)"
                fillOpacity={0.4}
                stroke="var(--color-newUsers)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
