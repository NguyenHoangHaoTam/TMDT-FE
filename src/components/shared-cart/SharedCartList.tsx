import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { useSharedCartStore } from "@/store/use-shared-cart.store";
import { CreateSharedCartDialog } from "./CreateSharedCartDialog";
import { getSharedOrderHistory, getOrderDetail } from "@/service/order/service";
import { Plus, ShoppingCart, Users, Calendar, Clock, Sparkles, TrendingUp, Package, ArrowRight, Filter, SortAsc, Grid3x3, List } from "lucide-react";
import { formatMoney } from "@/utils/helper";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { SharedCartStatus } from "@/types/shared-cart.type";
// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const statusLabels = {
  OPEN: "Đang mở",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

type SortOption = "newest" | "oldest" | "amount-desc" | "amount-asc" | "expires-asc" | "expires-desc";
type ViewMode = "grid" | "list";

export function SharedCartList() {
  const { cartList, isLoadingList, fetchCartList } = useSharedCartStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 columns x 3 rows
  
  // Filter & Sort state
  const [statusFilter, setStatusFilter] = useState<SharedCartStatus | "ALL">("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    fetchCartList();
  }, [fetchCartList]);

  // Reset to page 1 when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortOption]);

  // Filter và sort carts
  const filteredAndSortedCarts = useMemo(() => {
    let filtered = [...cartList];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((cart) => cart.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount-desc":
          const amountA = a.status === "COMPLETED" && a.paymentInfo ? a.paymentInfo.paidAmount : a.totalAmount;
          const amountB = b.status === "COMPLETED" && b.paymentInfo ? b.paymentInfo.paidAmount : b.totalAmount;
          return amountB - amountA;
        case "amount-asc":
          const amountA2 = a.status === "COMPLETED" && a.paymentInfo ? a.paymentInfo.paidAmount : a.totalAmount;
          const amountB2 = b.status === "COMPLETED" && b.paymentInfo ? b.paymentInfo.paidAmount : b.totalAmount;
          return amountA2 - amountB2;
        case "expires-asc":
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case "expires-desc":
          return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [cartList, statusFilter, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCarts.length / itemsPerPage);
  const paginatedCarts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedCarts.slice(startIndex, endIndex);
  }, [filteredAndSortedCarts, currentPage, itemsPerPage]);

  // Tính toán stats (dựa trên tất cả carts, không phải filtered)
  const stats = useMemo(() => {
    const totalCarts = cartList.length;
    const totalAmount = cartList.reduce((sum, cart) => {
      // Nếu giỏ hàng đã thanh toán và có paymentInfo, dùng paidAmount
      if (cart.status === "COMPLETED" && cart.paymentInfo) {
        return sum + cart.paymentInfo.paidAmount;
      }
      return sum + cart.totalAmount;
    }, 0);
    const openCarts = cartList.filter((c) => c.status === "OPEN").length;
    const totalParticipants = cartList.reduce((sum, cart) => sum + cart.totalParticipants + 1, 0);

    return {
      totalCarts,
      totalAmount,
      openCarts,
      totalParticipants,
    };
  }, [cartList]);

  if (isLoadingList) {
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

            {/* Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <Users className="h-6 w-6 text-white" />
                </div>
        <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Giỏ hàng chung
                  </h1>
                  <p className="text-gray-600 mt-1">
            Quản lý và chia sẻ giỏ hàng với bạn bè
          </p>
        </div>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
                size="lg"
              >
          <Plus className="h-4 w-4 mr-2" />
          Tạo giỏ hàng mới
        </Button>
      </div>
          </div>

          {/* Stats Cards */}
          {cartList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Tổng giỏ hàng</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.totalCarts}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
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
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700 mb-1">Đang mở</p>
                      <p className="text-3xl font-bold text-amber-900">{stats.openCarts}</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-1">Người tham gia</p>
                      <p className="text-3xl font-bold text-purple-900">{stats.totalParticipants}</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filter & Sort Controls */}
          {cartList.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SharedCartStatus | "ALL")}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả</SelectItem>
                      <SelectItem value="OPEN">Đang mở</SelectItem>
                      <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-gray-600" />
                  <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="oldest">Cũ nhất</SelectItem>
                      <SelectItem value="amount-desc">Giá trị: Cao → Thấp</SelectItem>
                      <SelectItem value="amount-asc">Giá trị: Thấp → Cao</SelectItem>
                      <SelectItem value="expires-asc">Hết hạn: Sớm nhất</SelectItem>
                      <SelectItem value="expires-desc">Hết hạn: Muộn nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 ml-auto sm:ml-0">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-9 w-9 p-0",
                      viewMode === "grid" && "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    )}
                    title="Xem dạng lưới"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-9 w-9 p-0",
                      viewMode === "list" && "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    )}
                    title="Xem dạng danh sách"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Results count */}
              <div className="text-sm text-gray-600 whitespace-nowrap">
                Hiển thị <span className="font-semibold text-gray-900">{paginatedCarts.length}</span> /{" "}
                <span className="font-semibold text-gray-900">{filteredAndSortedCarts.length}</span> giỏ hàng
              </div>
            </div>
          )}

          {/* Cart List */}
      {cartList.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-6">
                  <ShoppingCart className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa có giỏ hàng chung nào
          </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Tạo giỏ hàng chung đầu tiên để bắt đầu mua sắm cùng bạn bè
          </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Tạo giỏ hàng mới
                </Button>
              </CardContent>
            </Card>
          ) : filteredAndSortedCarts.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                  <Filter className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Không tìm thấy giỏ hàng
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Thử thay đổi bộ lọc hoặc tạo giỏ hàng mới
                </p>
                <Button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setSortOption("newest");
                  }}
                  size="lg"
                  variant="outline"
                  className="mr-2"
                >
                  Xóa bộ lọc
                </Button>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
                >
            <Plus className="h-4 w-4 mr-2" />
            Tạo giỏ hàng mới
          </Button>
              </CardContent>
        </Card>
      ) : (
            <>
              <div className={cn(
                "gap-4",
                viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
              )}>
                {paginatedCarts.map((cart) => {
                const isOpen = cart.status === "OPEN";
                const isCompleted = cart.status === "COMPLETED";
                const isCancelled = cart.status === "CANCELLED";

                return (
                  <Card
                    key={cart.id}
                    className={cn(
                      "border-0 shadow-md hover:shadow-2xl transition-all duration-300 group",
                      "bg-white/80 backdrop-blur-sm",
                      viewMode === "grid" && "hover:scale-[1.02] hover:-translate-y-1",
                      isOpen && "border-l-4 border-blue-500",
                      isCompleted && "border-l-4 border-green-500",
                      isCancelled && "border-l-4 border-gray-400",
                      viewMode === "list" && "flex flex-row"
                    )}
                  >
                    <CardContent className={cn(
                      "p-6",
                      viewMode === "list" ? "flex flex-row items-center gap-6 w-full" : "space-y-4"
                    )}>
                      {viewMode === "list" ? (
                        <>
                          {/* Left: Title & Status */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {cart.title}
                              </h3>
                              <Badge
                                className={cn(
                                  "border-0 shadow-sm text-white shrink-0",
                                  isOpen && "bg-gradient-to-r from-blue-500 to-blue-600",
                                  isCompleted && "bg-gradient-to-r from-green-500 to-green-600",
                                  isCancelled && "bg-gradient-to-r from-gray-400 to-gray-500"
                                )}
                              >
                                {statusLabels[cart.status]}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span>{cart.totalParticipants + 1} người</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Package className="h-4 w-4 text-emerald-600" />
                                <span>{cart.totalItems} sản phẩm</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-amber-600" />
                                <span>Hết hạn: {formatDate(cart.expiresAt)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span>Tạo: {formatDate(cart.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Center: Total Amount */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs font-medium text-gray-500">
                              {isCompleted ? "Đã thanh toán" : "Tổng tiền"}
                            </span>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                {formatMoney(
                                  isCompleted && cart.paymentInfo?.paidAmount && cart.paymentInfo.paidAmount > 0
                                    ? cart.paymentInfo.paidAmount
                                    : cart.totalAmount
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Right: Action Button */}
                          <div className="shrink-0 w-[180px]">
                            {isOpen ? (
                              <Button
                                asChild
                                className="w-full group/btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                              >
                                <Link to={`/shared-carts/${cart.id}`}>
                                  Xem chi tiết
                                  <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                className={cn(
                                  "w-full group/btn",
                                  "bg-gray-100 hover:bg-gray-200 text-gray-700",
                                  loadingOrderId === cart.id && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={async () => {
                                  if (isCompleted && loadingOrderId !== cart.id) {
                                    setLoadingOrderId(cart.id);
                                    try {
                                      const orderHistory = await getSharedOrderHistory();
                                      if (orderHistory?.orders && orderHistory.orders.length > 0) {
                                        let foundOrder = null;
                                        for (const orderSummary of orderHistory.orders.slice(0, 10)) {
                                          const orderDetail = await getOrderDetail(orderSummary.id);
                                          if (orderDetail?.sharedCartId === cart.id) {
                                            foundOrder = orderDetail;
                                            break;
                                          }
                                        }
                                        
                                        if (foundOrder) {
                                          navigate(`/orders/${foundOrder.id}`);
                                        } else {
                                          toast.error("Không tìm thấy đơn hàng tương ứng");
                                          navigate(`/shared-carts/${cart.id}`);
                                        }
                                      } else {
                                        navigate(`/shared-carts/${cart.id}`);
                                      }
                                    } catch (error) {
                                      console.error("Failed to find order:", error);
                                      toast.error("Không thể tìm đơn hàng");
                                      navigate(`/shared-carts/${cart.id}`);
                                    } finally {
                                      setLoadingOrderId(null);
                                    }
                                  } else {
                                    navigate(`/shared-carts/${cart.id}`);
                                  }
                                }}
                                disabled={loadingOrderId === cart.id}
                              >
                                {loadingOrderId === cart.id ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Đang tìm...
                                  </>
                                ) : (
                                  <>
                                    Xem đơn hàng
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Grid View - Original Layout */}
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {cart.title}
                  </h3>
                  <Badge
                                  className={cn(
                                    "border-0 shadow-sm text-white",
                                    isOpen && "bg-gradient-to-r from-blue-500 to-blue-600",
                                    isCompleted && "bg-gradient-to-r from-green-500 to-green-600",
                                    isCancelled && "bg-gradient-to-r from-gray-400 to-gray-500"
                                  )}
                  >
                    {statusLabels[cart.status]}
                  </Badge>
                </div>
              </div>

                            {/* Info */}
                            <div className="space-y-2.5 text-sm">
                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                  <Users className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <span className="font-medium">{cart.totalParticipants + 1} người tham gia</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                  <Package className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                                <span className="font-medium">{cart.totalItems} sản phẩm</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <div className="p-1.5 bg-amber-100 rounded-lg">
                                  <Calendar className="h-3.5 w-3.5 text-amber-600" />
                </div>
                                <span>Hết hạn: {formatDate(cart.expiresAt)}</span>
                </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <div className="p-1.5 bg-gray-100 rounded-lg">
                                  <Clock className="h-3.5 w-3.5 text-gray-600" />
                </div>
                                <span>Tạo: {formatDate(cart.createdAt)}</span>
                </div>
              </div>

                            {/* Total */}
                            <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  {isCompleted ? "Đã thanh toán:" : "Tổng tiền:"}
                                </span>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {formatMoney(
                                      isCompleted && cart.paymentInfo?.paidAmount && cart.paymentInfo.paidAmount > 0
                                        ? cart.paymentInfo.paidAmount
                                        : cart.totalAmount
                                    )}
                  </span>
                </div>
              </div>
                            </div>

                            {/* Action */}
                            {isOpen ? (
                              <Button
                                asChild
                                className="w-full group/btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                              >
                                <Link to={`/shared-carts/${cart.id}`}>
                                  Xem chi tiết
                                  <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                className={cn(
                                  "w-full group/btn",
                                  "bg-gray-100 hover:bg-gray-200 text-gray-700",
                                  loadingOrderId === cart.id && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={async () => {
                                  if (isCompleted && loadingOrderId !== cart.id) {
                                    setLoadingOrderId(cart.id);
                                    try {
                                      const orderHistory = await getSharedOrderHistory();
                                      if (orderHistory?.orders && orderHistory.orders.length > 0) {
                                        let foundOrder = null;
                                        for (const orderSummary of orderHistory.orders.slice(0, 10)) {
                                          const orderDetail = await getOrderDetail(orderSummary.id);
                                          if (orderDetail?.sharedCartId === cart.id) {
                                            foundOrder = orderDetail;
                                            break;
                                          }
                                        }
                                        
                                        if (foundOrder) {
                                          navigate(`/orders/${foundOrder.id}`);
                                        } else {
                                          toast.error("Không tìm thấy đơn hàng tương ứng");
                                          navigate(`/shared-carts/${cart.id}`);
                                        }
                                      } else {
                                        navigate(`/shared-carts/${cart.id}`);
                                      }
                                    } catch (error) {
                                      console.error("Failed to find order:", error);
                                      toast.error("Không thể tìm đơn hàng");
                                      navigate(`/shared-carts/${cart.id}`);
                                    } finally {
                                      setLoadingOrderId(null);
                                    }
                                  } else {
                                    navigate(`/shared-carts/${cart.id}`);
                                  }
                                }}
                                disabled={loadingOrderId === cart.id}
                              >
                                {loadingOrderId === cart.id ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Đang tìm đơn hàng...
                                  </>
                                ) : (
                                  <>
                                    Xem chi tiết đơn hàng
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                  </>
                                )}
                </Button>
                            )}
              </div>
                        </>
                      )}
                    </CardContent>
            </Card>
                );
              })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
        </div>
              )}
            </>
      )}

      <CreateSharedCartDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
        </div>
      </div>
    </div>
  );
}

