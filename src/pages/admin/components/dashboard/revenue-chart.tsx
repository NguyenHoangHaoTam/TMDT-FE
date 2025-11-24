"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { ChartConfig } from "@/components/ui/chart";
import type { RevenueData } from "@/service/admin/dashboard/service";
import { Skeleton } from "@/components/ui/skeleton";

export const description = "A bar chart with a label";

const chartConfig = {
  revenue: {
    label: "revenue",
    color: "#3B82F6",
  },
} satisfies ChartConfig;

export const formatDateToDDMM = (dateStr: string) => {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
};
export const formatNumber = (num: number) => {
  return num.toLocaleString("en-US");
};
export function ChartBarRevenue({
  data,
  isPending,
}: {
  data?: RevenueData[];
  isPending: boolean;
}) {
  const isEmpty = !data || data.length === 0;

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="flex gap-2">
          <div className="h-4 w-1 rounded-2xl bg-blue-500 "></div>{" "}
          <span>Doanh thu</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 h-[250px] flex items-center justify-center">
        {isPending && (
          <Skeleton className="w-full h-[200px] rounded-md bg-slate-200" />
        )}

        {!isPending && isEmpty && (
          <div className="text-sm text-slate-500">Không có dữ liệu</div>
        )}

        {!isPending && !isEmpty && (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-video p-6 h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => formatDateToDDMM(value)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={formatNumber}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
