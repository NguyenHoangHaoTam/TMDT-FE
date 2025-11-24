export type GroupBuyStatus = "ACTIVE" | "SUCCESS" | "EXPIRED" | "PENDING";

export interface GroupBuyCampaignSummary {
  id: number;
  productName: string;
  minQtyToUnlock: number;
  totalCommittedQty: number;
  status: GroupBuyStatus;
  thumbnail?: string | null;
  discountedPrice: number;
}

export interface GroupBuyCampaignCreateRequest {
  productId: number;
  minQtyToUnlock: number;
  discountedPrice: number;
  startAt: string;
  endAt: string;
}

export interface GroupBuyCampaignCreateResponse {
  id: number;
  productName: string;
  status: string;
  message: string;
}

export interface GroupBuyCommitRequest {
  campaignId: number;
  qtyCommitted: number;
  amountPaid?: number;
}

export interface GroupBuyCommitResponse {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  qtyCommitted: number;
  amountPaid: number;
  committedAt: string;
}

export interface GroupBuyProductOption {
  id: number;
  name: string;
  price: number;
  thumbnail?: string | null;
  stockQuantity: number;
}

