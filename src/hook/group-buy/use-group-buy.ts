import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  commitGroupBuy,
  createGroupBuyCampaign,
  fetchActiveGroupBuyCampaigns,
} from "@/service/group-buy/service";
import type {
  GroupBuyCampaignCreateRequest,
  GroupBuyCampaignCreateResponse,
  GroupBuyCampaignSummary,
  GroupBuyCommitRequest,
  GroupBuyCommitResponse,
} from "@/types/group-buy.type";

export const GroupBuyQueryKeys = {
  ACTIVE_CAMPAIGNS: ["group-buy", "campaigns", "active"] as const,
};

export function useGroupBuyCampaigns() {
  return useQuery<GroupBuyCampaignSummary[]>({
    queryKey: GroupBuyQueryKeys.ACTIVE_CAMPAIGNS,
    queryFn: fetchActiveGroupBuyCampaigns,
    refetchOnWindowFocus: false,
  });
}

export function useGroupBuyCommit() {
  const queryClient = useQueryClient();
  return useMutation<GroupBuyCommitResponse, unknown, GroupBuyCommitRequest>({
    mutationFn: commitGroupBuy,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GroupBuyQueryKeys.ACTIVE_CAMPAIGNS,
      });
    },
  });
}

export function useCreateGroupBuyCampaign() {
  const queryClient = useQueryClient();
  return useMutation<
    GroupBuyCampaignCreateResponse,
    unknown,
    GroupBuyCampaignCreateRequest
  >({
    mutationFn: createGroupBuyCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GroupBuyQueryKeys.ACTIVE_CAMPAIGNS,
      });
    },
  });
}

