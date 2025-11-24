import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  GroupBuyCampaignSummary,
  GroupBuyCommitRequest,
} from "@/types/group-buy.type";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

interface GroupBuyCommitDialogProps {
  campaign: GroupBuyCampaignSummary | null;
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: GroupBuyCommitRequest) => Promise<void> | void;
}

export function GroupBuyCommitDialog({
  campaign,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: GroupBuyCommitDialogProps) {
  const [qty, setQty] = useState(1);
  const [amountPaid, setAmountPaid] = useState("");

  useEffect(() => {
    if (open) {
      setQty(1);
      setAmountPaid("");
    }
  }, [open]);

  const totalAmount = useMemo(() => {
    if (!campaign) return 0;
    return qty * Number(campaign.discountedPrice || 0);
  }, [campaign, qty]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaign || qty < 1) return;
    onSubmit({
      campaignId: campaign.id,
      qtyCommitted: qty,
      amountPaid: amountPaid ? Number(amountPaid) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tham gia mua chung</DialogTitle>
          {campaign && (
            <DialogDescription>
              Bạn đang cam kết mua <strong>{campaign.productName}</strong> với
              giá ưu đãi{" "}
              <span className="font-semibold text-green-600">
                {currencyFormatter.format(campaign.discountedPrice)}
              </span>{" "}
              mỗi suất.
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-sm">
            <div>
              <p className="text-muted-foreground">Đã cam kết</p>
              <p className="text-lg font-semibold text-gray-900">
                {campaign?.totalCommittedQty ?? 0} / {campaign?.minQtyToUnlock ?? 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Còn thiếu</p>
              <p className="text-lg font-semibold text-gray-900">
                {campaign
                  ? Math.max(
                      campaign.minQtyToUnlock - campaign.totalCommittedQty,
                      0
                    )
                  : 0}{" "}
                suất
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty">Số lượng cam kết *</Label>
            <Input
              id="qty"
              type="number"
              min={1}
              value={qty}
              onChange={(event) =>
                setQty(Math.max(1, Number(event.target.value) || 1))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountPaid">
              Số tiền thanh toán trước (tuỳ chọn)
            </Label>
            <Input
              id="amountPaid"
              type="number"
              min={0}
              step={1000}
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
              placeholder="Có thể để trống"
            />
            <p className="text-xs text-muted-foreground">
              Hệ thống chỉ ghi nhận cam kết. Thanh toán đầy đủ khi chiến dịch
              thành công.
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50/80 p-4 text-sm text-emerald-900">
            <p className="font-semibold text-base">
              Tổng giá trị tạm tính: {currencyFormatter.format(totalAmount)}
            </p>
            <p>
              Bạn chỉ bị trừ tiền khi chiến dịch đạt đủ {campaign?.minQtyToUnlock}{" "}
              suất trong thời gian cho phép.
            </p>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Để sau
            </Button>
            <Button type="submit" disabled={isSubmitting || !campaign}>
              {isSubmitting ? "Đang gửi..." : "Xác nhận tham gia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

