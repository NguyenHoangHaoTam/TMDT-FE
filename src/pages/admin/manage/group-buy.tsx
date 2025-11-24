import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupBuyCampaignCard } from "@/components/group-buy/GroupBuyCampaignCard";
import { GroupBuySkeleton } from "@/components/group-buy/GroupBuySkeleton";
import {
  useCreateGroupBuyCampaign,
  useGroupBuyCampaigns,
} from "@/hook/group-buy/use-group-buy";
import { fetchGroupBuyProductOptions } from "@/service/group-buy/service";
import type { GroupBuyProductOption } from "@/types/group-buy.type";
import { RefreshCcw, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

const ONE_HOUR = 60 * 60 * 1000;
const ONE_WEEK = 7 * 24 * ONE_HOUR;

const defaultStart = () => new Date(Date.now() + ONE_HOUR).toISOString().slice(0, 16);
const defaultEnd = () => new Date(Date.now() + ONE_WEEK).toISOString().slice(0, 16);

export default function GroupBuyAdminPage() {
  const [productId, setProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [minQty, setMinQty] = useState("20");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [startAt, setStartAt] = useState(defaultStart());
  const [endAt, setEndAt] = useState(defaultEnd());

  const {
    data: campaigns = [],
    isPending: isLoadingCampaigns,
    refetch,
  } = useGroupBuyCampaigns();
  const createCampaignMutation = useCreateGroupBuyCampaign();

  const {
    data: productOptions = [],
    isPending: isLoadingProducts,
  } = useQuery<GroupBuyProductOption[]>({
    queryKey: ["group-buy", "products"],
    queryFn: () => fetchGroupBuyProductOptions({ size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const filteredOptions = useMemo(() => {
    if (!productSearch.trim()) return productOptions;
    return productOptions.filter((option) =>
      option.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productOptions, productSearch]);

  const selectedProduct = productOptions.find(
    (option) => String(option.id) === String(productId)
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productId) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }
    if (!discountedPrice) {
      toast.error("Vui lòng nhập giá ưu đãi");
      return;
    }
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      toast.error("Thời gian không hợp lệ");
      return;
    }
    if (startDate >= endDate) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }
    try {
      await createCampaignMutation.mutateAsync({
        productId: Number(productId),
        minQtyToUnlock: Number(minQty) || 1,
        discountedPrice: Number(discountedPrice),
        startAt,
        endAt,
      });
      setMinQty("20");
      setDiscountedPrice("");
      setStartAt(defaultStart());
      setEndAt(defaultEnd());
      refetch();
    } catch {
      // toast handled in service
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Group-buy
        </p>
        <h1 className="text-3xl font-bold">Chiến dịch mua chung</h1>
        <p className="text-sm text-muted-foreground">
          Tạo chiến dịch gom đơn để kích cầu các sản phẩm volume lớn.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <PlusCircle className="h-4 w-4" />
              Tạo chiến dịch mới
            </div>

            <div className="space-y-2">
              <Label htmlFor="productSearch">Tìm sản phẩm</Label>
              <Input
                id="productSearch"
                placeholder="Nhập tên sản phẩm..."
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Sản phẩm *</Label>
              <Select
                value={productId}
                onValueChange={(value) => setProductId(value)}
                disabled={isLoadingProducts || filteredOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm cho chiến dịch" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProducts && (
                    <SelectItem value="loading" disabled>
                      Đang tải danh sách...
                    </SelectItem>
                  )}
                  {filteredOptions.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.name} • {option.stockQuantity} tồn
                    </SelectItem>
                  ))}
                  {!isLoadingProducts && filteredOptions.length === 0 && (
                    <SelectItem value="empty" disabled>
                      Không tìm thấy sản phẩm phù hợp
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  Giá bán hiện tại:{" "}
                  <strong>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    }).format(selectedProduct.price)}
                  </strong>
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minQty">Số lượng mục tiêu *</Label>
                <Input
                  id="minQty"
                  type="number"
                  min={1}
                  value={minQty}
                  onChange={(event) => setMinQty(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountedPrice">Giá ưu đãi *</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  min={0}
                  step={1000}
                  value={discountedPrice}
                  onChange={(event) => setDiscountedPrice(event.target.value)}
                  placeholder="VD: 450000"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startAt">Bắt đầu *</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={startAt}
                  onChange={(event) => setStartAt(event.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endAt">Kết thúc *</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={endAt}
                  onChange={(event) => setEndAt(event.target.value)}
                  min={startAt}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setProductId("");
                  setDiscountedPrice("");
                  setMinQty("20");
                  setStartAt(defaultStart());
                  setEndAt(defaultEnd());
                }}
              >
                Làm mới
              </Button>
              <Button type="submit" disabled={createCampaignMutation.isPending}>
                {createCampaignMutation.isPending ? "Đang tạo..." : "Tạo chiến dịch"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                Đang hiển thị
              </p>
              <h2 className="text-xl font-semibold text-gray-900">
                {campaigns.length} chiến dịch active
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Tải lại
            </Button>
          </div>

          <div className="mt-6 grid gap-4">
            {isLoadingCampaigns &&
              Array.from({ length: 2 }).map((_, index) => (
                <GroupBuySkeleton key={index} />
              ))}

            {!isLoadingCampaigns && campaigns.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-muted-foreground">
                Chưa có chiến dịch nào đang mở.
              </div>
            )}

            {!isLoadingCampaigns &&
              campaigns.map((campaign) => (
                <GroupBuyCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  hideActions
                />
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

