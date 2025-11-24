import ApiEndPoint from "@/service/api";
import { api, publicApi } from "@/service/config-api";
import type { ApiResponse } from "@/types/response-api.type";
import type {
  GroupBuyCampaignCreateRequest,
  GroupBuyCampaignCreateResponse,
  GroupBuyCampaignSummary,
  GroupBuyCommitRequest,
  GroupBuyCommitResponse,
  GroupBuyProductOption,
} from "@/types/group-buy.type";
import type { ProductPageResponse } from "@/types/home.type";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

const DEFAULT_PRODUCT_PAGE_SIZE = 50;

const pad = (value: number) => value.toString().padStart(2, "0");

export function formatDateTimePayload(value: string) {
  if (!value) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

export async function fetchActiveGroupBuyCampaigns() {
  try {
    const res = await publicApi.get<
      ApiResponse<GroupBuyCampaignSummary[]>
    >(ApiEndPoint.GROUP_BUY_ACTIVE);

    if (res?.data?.code === 200) {
      return res.data.data ?? [];
    }

    const message =
      res?.data?.message || "Không thể tải danh sách chiến dịch mua chung";
    toast.error(message);
    return [];
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message ||
        "Không thể tải danh sách chiến dịch mua chung"
      : "Không thể tải danh sách chiến dịch mua chung";
    toast.error(message);
    return [];
  }
}

export async function commitGroupBuy(
  payload: GroupBuyCommitRequest
): Promise<GroupBuyCommitResponse> {
  try {
    const body = {
      campaignId: payload.campaignId,
      qtyCommitted: Number(payload.qtyCommitted),
      amountPaid:
        payload.amountPaid === undefined
          ? undefined
          : Number(payload.amountPaid),
    };
    const res = await api.post<ApiResponse<GroupBuyCommitResponse>>(
      ApiEndPoint.GROUP_BUY_COMMIT,
      body
    );
    if (res?.data?.code === 200) {
      toast.success(res.data?.message || "Tham gia chiến dịch thành công");
      return res.data.data;
    }
    const message =
      res?.data?.message || "Không thể tham gia chiến dịch, vui lòng thử lại";
    toast.error(message);
    throw new Error(message);
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message ||
        "Không thể tham gia chiến dịch, vui lòng thử lại"
      : "Không thể tham gia chiến dịch, vui lòng thử lại";
    toast.error(message);
    throw error;
  }
}

export async function createGroupBuyCampaign(
  payload: GroupBuyCampaignCreateRequest
): Promise<GroupBuyCampaignCreateResponse> {
  try {
    const body = {
      productId: Number(payload.productId),
      minQtyToUnlock: Number(payload.minQtyToUnlock),
      discountedPrice: Number(payload.discountedPrice),
      startAt: formatDateTimePayload(payload.startAt),
      endAt: formatDateTimePayload(payload.endAt),
    };
    const res = await api.post<ApiResponse<GroupBuyCampaignCreateResponse>>(
      ApiEndPoint.GROUP_BUY_CREATE,
      body
    );

    if (res?.data?.code === 200) {
      toast.success(res.data?.message || "Tạo chiến dịch thành công");
      return res.data.data;
    }

    const message =
      res?.data?.message || "Không thể tạo chiến dịch, vui lòng thử lại";
    toast.error(message);
    throw new Error(message);
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message ||
        "Không thể tạo chiến dịch, vui lòng thử lại"
      : "Không thể tạo chiến dịch, vui lòng thử lại";
    toast.error(message);
    throw error;
  }
}

export async function fetchGroupBuyProductOptions(params?: {
  page?: number;
  size?: number;
}) {
  const { page = 0, size = DEFAULT_PRODUCT_PAGE_SIZE } = params ?? {};
  try {
    const res = await publicApi.get<ApiResponse<ProductPageResponse>>(
      ApiEndPoint.PRODUCT_ALL,
      {
        params: { page, size },
      }
    );

    if (res?.data?.code === 200) {
      const content = res.data.data?.content ?? [];
      return content.map<GroupBuyProductOption>((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price ?? 0),
        thumbnail: product.images?.[0]?.url,
        stockQuantity: product.stockQuantity,
      }));
    }

    const message =
      res?.data?.message || "Không thể tải danh sách sản phẩm cho mua chung";
    toast.error(message);
    return [];
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message ||
        "Không thể tải danh sách sản phẩm cho mua chung"
      : "Không thể tải danh sách sản phẩm cho mua chung";
    toast.error(message);
    return [];
  }
}

