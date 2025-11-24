import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GroupBuyCampaignCard } from "@/components/group-buy/GroupBuyCampaignCard";
import { GroupBuyCommitDialog } from "@/components/group-buy/GroupBuyCommitDialog";
import { GroupBuySkeleton } from "@/components/group-buy/GroupBuySkeleton";
import {
  useGroupBuyCampaigns,
  useGroupBuyCommit,
} from "@/hook/group-buy/use-group-buy";
import type { GroupBuyCampaignSummary } from "@/types/group-buy.type";
import { useAuthStore } from "@/store/use-auth.store";
import { ShieldCheck, Sparkles, UsersRound } from "lucide-react";

export default function GroupBuyPage() {
  const { data: campaigns = [], isPending } = useGroupBuyCampaigns();
  const commitMutation = useGroupBuyCommit();
  const [selectedCampaign, setSelectedCampaign] =
    useState<GroupBuyCampaignSummary | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return {
        totalCampaigns: 0,
        totalParticipants: 0,
        successRate: 0,
      };
    }
    const totalParticipants = campaigns.reduce(
      (sum, campaign) => sum + campaign.totalCommittedQty,
      0
    );
    const successCount = campaigns.filter(
      (campaign) => campaign.status === "SUCCESS"
    ).length;
    const successRate = Math.round(
      (successCount / campaigns.length) * 100 || 0
    );
    return {
      totalCampaigns: campaigns.length,
      totalParticipants,
      successRate,
    };
  }, [campaigns]);

  const handleCommitClick = (campaign: GroupBuyCampaignSummary) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent("/group-buy")}`);
      return;
    }
    setSelectedCampaign(campaign);
  };

  const handleSubmitCommit = async (payload: {
    campaignId: number;
    qtyCommitted: number;
    amountPaid?: number;
  }) => {
    try {
      await commitMutation.mutateAsync(payload);
      setSelectedCampaign(null);
    } catch {
      // toast hiển thị trong service
    }
  };

  const isEmpty = !isPending && campaigns.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <section className="bg-gradient-to-br from-green-600 via-emerald-500 to-lime-500 text-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Mở ưu đãi khi đủ số lượng
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">
                Mua chung nửa giá cùng cộng đồng dã ngoại GOPICNIC
              </h1>
              <p className="mt-4 text-base text-white/90 lg:text-lg">
                Cam kết nhanh, giữ chỗ tốt. Chỉ thanh toán khi chiến dịch đạt đủ
                số lượng. Phù hợp cho các nhóm camping, trekking, phượt muốn
                săn deal lớn mà vẫn chắc chắn lịch nhận hàng.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById("group-buy-list")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-white text-green-600 hover:bg-white/90"
                >
                  Khám phá chiến dịch
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="bg-white/15 text-white hover:bg-white/25"
                  onClick={() => navigate("/shared-carts")}
                >
                  Xem giỏ hàng chung
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <HighlightCard
                title="Chiến dịch đang mở"
                value={`${stats.totalCampaigns}+`}
                icon={<Sparkles className="h-5 w-5" />}
              />
              <HighlightCard
                title="Người đã cam kết"
                value={stats.totalParticipants}
                icon={<UsersRound className="h-5 w-5" />}
              />
              <HighlightCard
                title="Tỉ lệ đạt mục tiêu"
                value={`${stats.successRate}%`}
                icon={<ShieldCheck className="h-5 w-5" />}
              />
              <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-white/80">Cam kết an toàn</p>
                <p className="mt-2 text-xl font-semibold">
                  Hoàn tiền nếu không đủ số lượng
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Không cần thanh toán toàn bộ trước. Chốt đơn khi chiến dịch
                  thành công.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="group-buy-list"
        className="container mx-auto px-4 py-10 lg:py-16"
      >
        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Chiến dịch đang hoạt động
          </p>
          <h2 className="text-3xl font-bold text-gray-900">
            Chọn sản phẩm bạn muốn gom cùng cộng đồng
          </h2>
          <p className="text-muted-foreground">
            Chúng tôi cập nhật số lượng realtime để bạn dễ theo dõi tiến độ.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {isPending &&
            Array.from({ length: 4 }).map((_, index) => (
              <GroupBuySkeleton key={index} />
            ))}

          {isEmpty && (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white/50 p-10 text-center">
              <h3 className="text-2xl font-semibold text-gray-900">
                Chưa có chiến dịch nào đang mở
              </h3>
              <p className="mt-2 text-gray-600">
                Đăng nhập để nhận thông báo khi có chiến dịch mới hoặc tạo chiến
                dịch trong trang quản trị.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => navigate("/login")}>Đăng nhập</Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Quay về trang chủ
                </Button>
              </div>
            </div>
          )}

          {!isPending &&
            campaigns.map((campaign) => (
              <GroupBuyCampaignCard
                key={campaign.id}
                campaign={campaign}
                onCommit={handleCommitClick}
                isProcessing={commitMutation.isPending}
              />
            ))}
        </div>
      </section>

      <GroupBuyCommitDialog
        campaign={selectedCampaign}
        open={!!selectedCampaign}
        onOpenChange={(open) => !open && setSelectedCampaign(null)}
        onSubmit={handleSubmitCommit}
        isSubmitting={commitMutation.isPending}
      />
    </div>
  );
}

function HighlightCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur">
      <div className="mb-3 inline-flex items-center gap-2 text-sm text-white/80">
        {icon}
        {title}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

