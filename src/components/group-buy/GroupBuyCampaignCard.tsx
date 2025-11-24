import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { GroupBuyCampaignSummary } from "@/types/group-buy.type";
import {
  Award,
  CheckCircle2,
  Clock,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import type { JSX } from "react";

interface GroupBuyCampaignCardProps {
  campaign: GroupBuyCampaignSummary;
  onCommit?: (campaign: GroupBuyCampaignSummary) => void;
  isProcessing?: boolean;
  hideActions?: boolean;
}

const statusMeta: Record<
  string,
  { label: string; variant: "default" | "outline" | "secondary"; icon: JSX.Element }
> = {
  ACTIVE: {
    label: "Đang mở",
    variant: "default",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  SUCCESS: {
    label: "Đã đủ số lượng",
    variant: "secondary",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  EXPIRED: {
    label: "Đã đóng",
    variant: "outline",
    icon: <Award className="h-3.5 w-3.5" />,
  },
  PENDING: {
    label: "Chuẩn bị mở",
    variant: "outline",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function GroupBuyCampaignCard({
  campaign,
  onCommit,
  isProcessing,
  hideActions,
}: GroupBuyCampaignCardProps) {
  const progress =
    campaign.minQtyToUnlock > 0
      ? Math.min(
          Math.round((campaign.totalCommittedQty / campaign.minQtyToUnlock) * 100),
          100
        )
      : 0;
  const remaining = Math.max(
    campaign.minQtyToUnlock - campaign.totalCommittedQty,
    0
  );
  const status = statusMeta[campaign.status] || statusMeta.ACTIVE;

  const handleCommit = () => {
    if (!onCommit) return;
    onCommit(campaign);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <img
              src={campaign.thumbnail || "/assets/img/img-placeholder.png"}
              alt={campaign.productName}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).src =
                  "/assets/img/img-placeholder.png";
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={status.variant}
                className="flex items-center gap-1.5"
              >
                {status.icon}
                <span>{status.label}</span>
              </Badge>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                #{campaign.id}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
              {campaign.productName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Giá ưu đãi:{" "}
              <span className="font-semibold text-green-600">
                {currencyFormatter.format(campaign.discountedPrice)}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-green-600" />
              Đã tham gia:{" "}
              <strong className="text-gray-900">
                {campaign.totalCommittedQty}
              </strong>
            </span>
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-amber-600" />
              Mục tiêu:{" "}
              <strong className="text-gray-900">
                {campaign.minQtyToUnlock} suất
              </strong>
            </span>
          </div>
          <Progress value={progress} />
          <div className="text-xs text-muted-foreground">
            {remaining > 0
              ? `Còn thiếu ${remaining} suất để mở ưu đãi`
              : "Đã đạt mục tiêu số lượng"}
          </div>
        </div>

        {!hideActions && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {campaign.status === "ACTIVE"
                ? "Cam kết ngay để giữ chỗ và giá tốt!"
                : campaign.status === "SUCCESS"
                ? "Chiến dịch đã đủ số lượng, chuẩn bị giao hàng."
                : "Chiến dịch đã đóng."}
            </div>
            {onCommit && (
              <Button
                onClick={handleCommit}
                disabled={campaign.status !== "ACTIVE" || isProcessing}
                className="min-w-[160px]"
              >
                {campaign.status === "ACTIVE" ? "Tham gia ngay" : "Đã kết thúc"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

