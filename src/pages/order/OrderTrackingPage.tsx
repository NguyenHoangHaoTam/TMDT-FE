import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  CheckCircle2,
  Truck,
  X,
  Calendar,
  ShoppingBag,
  Users,
  Loader2,
  Search,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPersonalOrderHistory,
  getSharedOrderHistory,
  confirmReceived,
  type OrderSummary,
  type OrderStatus,
} from "@/service/order/service";
import { formatMoney } from "@/utils/helper";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    progress: number;
    description: string;
  }
> = {
  PENDING: {
    label: "Chờ xử lý",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: <Clock className="h-4 w-4" />,
    progress: 20,
    description: "Đơn hàng đang chờ được xử lý",
  },
  PAID: {
    label: "Chờ nhận hàng",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: <Package className="h-4 w-4" />,
    progress: 50,
    description: "Đơn hàng đã sẵn sàng giao hàng. Vui lòng chờ nhận hàng và xác nhận khi đã nhận được.",
  },
  SHIPPED: {
    label: "Chờ nhận hàng",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: <Truck className="h-4 w-4" />,
    progress: 75,
    description: "Đơn hàng đang được vận chuyển, vui lòng chờ nhận hàng",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
    progress: 100,
    description: "Đơn hàng đã được giao thành công",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: <X className="h-4 w-4" />,
    progress: 0,
    description: "Đơn hàng đã bị hủy",
  },
};

interface CombinedOrder extends OrderSummary {
  orderType: "SINGLE" | "GROUP";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [allOrders, setAllOrders] = useState<CombinedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrderType, setSelectedOrderType] = useState<"ALL" | "SINGLE" | "GROUP">("ALL");
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);

  const { data: personalOrders, isLoading: isLoadingPersonal } = useQuery({
    queryKey: ["personal-order-history"],
    queryFn: getPersonalOrderHistory,
  });

  const { data: sharedOrders, isLoading: isLoadingShared } = useQuery({
    queryKey: ["shared-order-history"],
    queryFn: getSharedOrderHistory,
  });

  const confirmReceivedMutation = useMutation({
    mutationFn: (orderId: number) => confirmReceived(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal-order-history"] });
      queryClient.invalidateQueries({ queryKey: ["shared-order-history"] });
      setConfirmingOrderId(null);
      toast.success("Xác nhận đã nhận hàng thành công!");
    },
    onError: () => {
      setConfirmingOrderId(null);
    },
  });

  useEffect(() => {
    const combined: CombinedOrder[] = [];

    if (personalOrders?.orders) {
      personalOrders.orders.forEach((order) => {
        combined.push({
          ...order,
          orderType: "SINGLE" as const,
        });
      });
    }

    if (sharedOrders?.orders) {
      sharedOrders.orders.forEach((order) => {
        combined.push({
          ...order,
          orderType: "GROUP" as const,
        });
      });
    }

    // Sắp xếp theo ngày tạo mới nhất
    combined.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    setAllOrders(combined);
  }, [personalOrders, sharedOrders]);

  // Tính toán stats
  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const totalAmount = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = allOrders.filter((o) => o.status === "PENDING" || o.status === "PAID").length;
    const shippingOrders = allOrders.filter((o) => o.status === "SHIPPED").length;
    const completedOrders = allOrders.filter((o) => o.status === "COMPLETED").length;

    return {
      totalOrders,
      totalAmount,
      pendingOrders,
      shippingOrders,
      completedOrders,
    };
  }, [allOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = allOrders;

    // Filter by order type
    if (selectedOrderType !== "ALL") {
      filtered = filtered.filter((order) => order.orderType === selectedOrderType);
    }

    // Filter by status
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        return order.id.toString().includes(query);
      });
    }

    return filtered;
  }, [allOrders, selectedStatus, selectedOrderType, searchQuery]);

  const isLoading = isLoadingPersonal || isLoadingShared;

  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  const handleConfirmReceived = (e: React.MouseEvent, orderId: number) => {
    e.stopPropagation(); // Prevent card click
    setConfirmingOrderId(orderId);
    confirmReceivedMutation.mutate(orderId);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>

            {/* Orders Skeleton */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Theo dõi đơn hàng
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý và theo dõi tất cả đơn hàng của bạn
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {allOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Tổng đơn hàng</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.totalOrders}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 mb-1">Tổng giá trị</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {formatMoney(stats.totalAmount)}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700 mb-1">Đang xử lý</p>
                      <p className="text-3xl font-bold text-amber-900">{stats.pendingOrders}</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Đang giao hàng</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.shippingOrders}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Hoàn thành</p>
                      <p className="text-3xl font-bold text-green-900">{stats.completedOrders}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          {allOrders.length > 0 && (
            <div className="space-y-4">
              {/* Order Type Tabs */}
              <Tabs
                value={selectedOrderType}
                onValueChange={(value) => setSelectedOrderType(value as "ALL" | "SINGLE" | "GROUP")}
                className="w-full"
              >
                <TabsList className="w-full justify-start bg-white border border-gray-200 p-1 h-auto shadow-sm">
                  <TabsTrigger
                    value="ALL"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white px-4 py-2.5 font-medium"
                  >
                    Tất cả ({allOrders.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="SINGLE"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white px-4 py-2.5 font-medium"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Cá nhân ({allOrders.filter((o) => o.orderType === "SINGLE").length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="GROUP"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white px-4 py-2.5 font-medium"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Nhóm ({allOrders.filter((o) => o.orderType === "GROUP").length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo mã đơn hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 text-base border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>

              {/* Status Tabs */}
              <Tabs
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as OrderStatus | "ALL")}
                className="w-full"
              >
                <TabsList className="w-full justify-start bg-white border border-gray-200 p-1 h-auto shadow-sm">
                  <TabsTrigger
                    value="ALL"
                    className="data-[state=active]:bg-green-500 data-[state=active]:text-white px-4 py-2"
                  >
                    Tất cả ({filteredOrders.length})
                  </TabsTrigger>
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const count = allOrders.filter((o) => o.status === status && (selectedOrderType === "ALL" || o.orderType === selectedOrderType)).length;
                    return (
                      <TabsTrigger
                        key={status}
                        value={status}
                        className={cn(
                          "px-4 py-2",
                          `data-[state=active]:${config.bgColor}`,
                          `data-[state=active]:${config.color}`
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {config.icon}
                          {config.label} ({count})
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Orders List */}
          {allOrders.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm và tận hưởng những sản phẩm tuyệt vời!
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
                  onClick={() => navigate("/products")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Khám phá sản phẩm
                </Button>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-gray-600 mb-6">
                  Không có đơn hàng nào phù hợp với bộ lọc của bạn.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("ALL");
                    setSelectedOrderType("ALL");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const displayStatus = statusConfig[order.status];
                const isGroup = order.orderType === "GROUP";

                return (
                  <Card
                    key={order.id}
                    className={cn(
                      "border-0 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group",
                      "bg-white/80 backdrop-blur-sm",
                      "hover:scale-[1.01] hover:-translate-y-1",
                      displayStatus.borderColor && `border-l-4 ${displayStatus.borderColor}`
                    )}
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {order.firstProductThumbnail ? (
                            <div className="relative overflow-hidden rounded-xl shadow-lg">
                              <img
                                src={order.firstProductThumbnail}
                                alt="Product"
                                className="w-24 h-24 lg:w-28 lg:h-28 object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl" />
                            </div>
                          ) : (
                            <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner">
                              <Package className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0 space-y-4">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                  Đơn hàng #{order.id}
                                </h3>
                                <Badge
                                  className={cn(
                                    "border-0 shadow-sm",
                                    isGroup
                                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                      : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                                  )}
                                >
                                  {isGroup ? (
                                    <>
                                      <Users className="h-3 w-3 mr-1" />
                                      Đơn nhóm
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="h-3 w-3 mr-1" />
                                      Đơn cá nhân
                                    </>
                                  )}
                                </Badge>
                                <Badge
                                  className={cn(
                                    "border-0 shadow-sm",
                                    displayStatus.color,
                                    displayStatus.bgColor
                                  )}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {displayStatus.icon}
                                    {displayStatus.label}
                                  </span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">{formatDate(order.createdAt)}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs">{formatFullDate(order.createdAt)}</span>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="text-right space-y-2">
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                  {formatMoney(order.totalAmount)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status Progress */}
                          {order.status !== "CANCELLED" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Tiến độ đơn hàng</span>
                                <span className="font-medium">{displayStatus.progress}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    displayStatus.progress === 100
                                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                      : displayStatus.progress >= 75
                                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                      : displayStatus.progress >= 40
                                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                      : displayStatus.progress >= 30
                                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                      : "bg-gradient-to-r from-amber-500 to-amber-600"
                                  )}
                                  style={{ width: `${displayStatus.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {displayStatus.description}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-3">
                            <p className="text-sm text-gray-500 flex-1">
                              Nhấp để xem chi tiết đơn hàng
                            </p>
                            {/* Hiển thị button xác nhận:
                                - SHIPPED: backward compatible
                                - PAID + VNPay: User có thể vào OrderDetailPage để xác nhận
                                Note: OrderSummary không có paymentMethod, nên chỉ hiển thị khi SHIPPED ở đây */}
                            {order.status === "SHIPPED" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                onClick={(e) => handleConfirmReceived(e, order.id)}
                                disabled={confirmingOrderId === order.id || confirmReceivedMutation.isPending}
                              >
                                {confirmingOrderId === order.id || confirmReceivedMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    Đang xử lý...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-2" />
                                    Xác nhận đã nhận hàng
                                  </>
                                )}
                              </Button>
                            )}
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
