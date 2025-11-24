import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
// Table component not used in this component
import { useSharedCartStore } from "@/store/use-shared-cart.store";
import { useAuthStore } from "@/store/use-auth.store";
import { InviteParticipantDialog } from "./InviteParticipantDialog";
import { SharedCartCheckoutDialog } from "./SharedCartCheckoutDialog";
import { getSharedOrderHistory, getOrderDetail } from "@/service/order/service";
import {
  Plus,
  UserPlus,
  X,
  Minus,
  Trash2,
  LogOut,
  CheckCircle,
  XCircle,
  Edit,
  Users,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Clock,
  TrendingUp,
  Package,
} from "lucide-react";
import { formatMoney } from "@/utils/helper";
import { cn } from "@/lib/utils";
// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusLabels = {
  OPEN: "Đang mở",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

export function SharedCartDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentCart,
    isLoadingDetail,
    fetchCartDetail,
    updateQuantity,
    removeItem,
    closeCart,
    cancelCart,
    leave,
    removeParticipant,
    updateCartInfo,
    pendingInvitations,
  } = useSharedCartStore();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditCartDialogOpen, setIsEditCartDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCartDetail(id);
    }
  }, [id, fetchCartDetail]);

  // Redirect to order detail if cart is COMPLETED
  useEffect(() => {
    if (currentCart && currentCart.status === "COMPLETED") {
      const findAndRedirectToOrder = async () => {
        try {
          // Fetch shared order history để tìm order tương ứng
          const orderHistory = await getSharedOrderHistory();
          if (orderHistory?.orders && orderHistory.orders.length > 0) {
            // Tìm order có sharedCartId === currentCart.id
            let foundOrder = null;
            for (const orderSummary of orderHistory.orders.slice(0, 10)) {
              const orderDetail = await getOrderDetail(orderSummary.id);
              if (orderDetail?.sharedCartId === currentCart.id) {
                foundOrder = orderDetail;
                break;
              }
            }
            
            if (foundOrder) {
              navigate(`/orders/${foundOrder.id}`, { replace: true });
            }
          }
        } catch (error) {
          console.error("Failed to find order for completed cart:", error);
          // Nếu không tìm thấy order, vẫn hiển thị cart detail (fallback)
        }
      };
      
      findAndRedirectToOrder();
    }
  }, [currentCart, navigate]);

  if (isLoadingDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-96 rounded-xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giỏ hàng</h3>
              <p className="text-gray-600 mb-6">Giỏ hàng bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
              <Button
                onClick={() => navigate("/shared-carts")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isOwner = user && Number(user.id) === currentCart.ownerId;
  const currentUserParticipant = currentCart.participants.find(
    (p) => user && Number(user.id) === p.userId
  );
  const isParticipant = !!currentUserParticipant;

  const handleUpdateQuantity = async (
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      await removeItem({ sharedCartId: currentCart.id, productId });
    } else {
      await updateQuantity({
        sharedCartId: currentCart.id,
        productId,
        quantity: newQuantity,
      });
    }
  };

  const handleCloseCart = async () => {
    if (window.confirm("Bạn có chắc muốn đóng giỏ hàng này?")) {
      await closeCart(currentCart.id);
    }
  };

  const handleCancelCart = async () => {
    if (window.confirm("Bạn có chắc muốn hủy giỏ hàng này?")) {
      await cancelCart(currentCart.id);
    }
  };

  const handleLeave = async () => {
    if (window.confirm("Bạn có chắc muốn rời khỏi giỏ hàng này?")) {
      await leave(currentCart.id);
      navigate("/shared-carts");
    }
  };

  const handleRemoveParticipant = async (participantUserId: number) => {
    if (window.confirm("Bạn có chắc muốn xóa người này khỏi giỏ hàng?")) {
      await removeParticipant(currentCart.id, participantUserId);
    }
  };

  const handleUpdateCartInfo = async (data: {
    title: string;
    expiresAt: string;
  }) => {
    await updateCartInfo({
      sharedCartId: currentCart.id,
      title: data.title,
      expiresAt: data.expiresAt,
    });
    setIsEditCartDialogOpen(false);
  };

  const isOpen = currentCart.status === "OPEN";
  const isCompleted = currentCart.status === "COMPLETED";
  const isCancelled = currentCart.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => navigate("/shared-carts")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {currentCart.title}
                      </h1>
                      {isOwner && currentCart.status === "OPEN" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsEditCartDialogOpen(true)}
                          title="Chỉnh sửa thông tin giỏ hàng"
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <Badge
                        className={cn(
                          "border-0 shadow-sm text-white",
                          isOpen && "bg-gradient-to-r from-blue-500 to-blue-600",
                          isCompleted && "bg-gradient-to-r from-green-500 to-green-600",
                          isCancelled && "bg-gradient-to-r from-gray-400 to-gray-500"
                        )}
                      >
                        {statusLabels[currentCart.status]}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Chủ sở hữu: {currentCart.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Hết hạn: {formatDate(currentCart.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {currentCart.status === "OPEN" && (
                <div className="flex flex-wrap gap-2">
                  {isOwner && (
                    <>
                      {currentCart.items.length > 0 && (
                        <Button
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
                          onClick={() => setIsCheckoutDialogOpen(true)}
                          size="lg"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Thanh toán
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(true)}
                        size="lg"
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Mời người
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCloseCart}
                        size="lg"
                        className="border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Đóng
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelCart}
                        size="lg"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                    </>
                  )}
                  {isParticipant && !isOwner && (
                    <Button
                      variant="outline"
                      onClick={handleLeave}
                      size="lg"
                      className="border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Rời khỏi
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {/* Items Section */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      Sản phẩm ({currentCart.totalItems})
                    </h2>
                  </div>
                  {currentCart.items.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Chưa có sản phẩm nào
                      </h3>
                      <p className="text-gray-600">
                        Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm cùng bạn bè
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentCart.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-300 bg-white group"
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                item.productImageUrl ||
                                "/assets/img/img-placeholder.png"
                              }
                              alt={item.productName}
                              className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {item.productName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Thêm bởi: <span className="font-medium">{item.addedByUserName}</span>
                            </p>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                {currentCart.status === "OPEN" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item.productId,
                                          item.quantity - 1
                                        )
                                      }
                                      disabled={isLoadingDetail}
                                      className="h-8 w-8 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-10 text-center font-bold text-gray-900">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleUpdateQuantity(
                                          item.productId,
                                          item.quantity + 1
                                        )
                                      }
                                      disabled={isLoadingDetail}
                                      className="h-8 w-8 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {currentCart.status !== "OPEN" && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                                    <Package className="h-4 w-4 text-gray-600" />
                                    <span className="font-bold text-gray-900">
                                      {item.quantity}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 mb-1">
                                    {formatMoney(item.priceAtAdd)}đ x {item.quantity}
                                  </p>
                                  <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {formatMoney(item.subtotal)}
                                  </p>
                                </div>
                                {currentCart.status === "OPEN" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeItem({
                                        sharedCartId: currentCart.id,
                                        productId: item.productId,
                                      })
                                    }
                                    disabled={isLoadingDetail}
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    Người tham gia ({currentCart.participants.length + 1}
                    {(() => {
                      const pending = pendingInvitations.get(currentCart.id);
                      const pendingCount = pending ? pending.size : 0;
                      return pendingCount > 0 ? ` + ${pendingCount} đang chờ` : "";
                    })()})
                  </h2>
                  <div className="space-y-2">
                    {/* Owner */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        {currentCart.ownerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{currentCart.ownerName}</p>
                        <p className="text-xs text-gray-600">Chủ sở hữu</p>
                      </div>
                      <Badge className="bg-blue-600 text-white">Owner</Badge>
                    </div>

                    {/* Participants */}
                    {currentCart.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold shadow-md">
                          {participant.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{participant.userName}</p>
                          <p className="text-xs text-gray-600 truncate">
                            {participant.userEmail}
                          </p>
                        </div>
                        {isOwner &&
                          currentCart.status === "OPEN" &&
                          participant.userId !== currentCart.ownerId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveParticipant(participant.userId)
                              }
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                      </div>
                    ))}
                    
                    {/* Pending Invitations */}
                    {isOwner && currentCart.status === "OPEN" && (() => {
                      const pending = pendingInvitations.get(currentCart.id);
                      if (!pending || pending.size === 0) return null;
                      
                      // Lấy danh sách identifiers từ Map
                      // Kiểm tra xem userId có trong participants không (nếu có thì đã join rồi, không hiển thị)
                      const joinedUserIds = new Set(currentCart.participants.map(p => p.userId));
                      
                      return Array.from(pending.entries())
                        .filter(([_, userId]) => {
                          // Nếu có userId và userId đã join thì không hiển thị
                          if (userId !== null && joinedUserIds.has(userId)) {
                            return false;
                          }
                          return true;
                        })
                        .map(([identifier, userId], index) => {
                          // Nếu có userId, thử lấy tên từ participants (nhưng thường thì đã bị loại bỏ rồi)
                          let displayName = identifier;
                          if (userId !== null) {
                            const participant = currentCart.participants.find(p => p.userId === userId);
                            if (participant) {
                              displayName = participant.userName;
                            }
                          }
                          
                          return (
                            <div
                              key={`pending-${index}-${identifier}`}
                              className="flex items-center gap-3 p-3 border border-amber-200 rounded-lg bg-amber-50/50 hover:border-amber-300 transition-all duration-300"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">{displayName}</p>
                                <p className="text-xs text-amber-600">Đang chờ xác nhận</p>
                              </div>
                              <Badge className="bg-amber-500 text-white">
                                <Clock className="h-3 w-3 mr-1" />
                                Đang chờ
                              </Badge>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    Tóm tắt
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Tổng sản phẩm:</span>
                      <span className="font-bold text-gray-900">{currentCart.totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
                      <span className="text-sm font-semibold text-white">
                        {isCompleted ? "Đã thanh toán:" : "Tổng tiền:"}
                      </span>
                      <span className="text-xl font-bold text-white">
                        {formatMoney(
                          isCompleted && currentCart.paymentInfo
                            ? currentCart.paymentInfo.paidAmount
                            : currentCart.totalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info - Only show when cart is COMPLETED and has payment info */}
              {currentCart.status === "COMPLETED" && currentCart.paymentInfo && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100/50 border-green-200">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-700">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      Lịch sử thanh toán
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          Đã thanh toán bởi:
                        </span>
                        <span className="font-semibold text-green-700">
                          {currentCart.paymentInfo.paidByName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          Phương thức:
                        </span>
                        <Badge className="bg-green-600 text-white shadow-sm">
                          {currentCart.paymentInfo.paymentMethod === "VNPAY"
                            ? "VNPay"
                            : currentCart.paymentInfo.paymentMethod === "COD"
                            ? "COD"
                            : "MoMo"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          Thời gian:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatDate(currentCart.paymentInfo.paidAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Dialogs */}
          <InviteParticipantDialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
            sharedCartId={currentCart.id}
          />

          {currentCart.status === "OPEN" && isOwner && (
            <SharedCartCheckoutDialog
              open={isCheckoutDialogOpen}
              onOpenChange={setIsCheckoutDialogOpen}
              sharedCart={currentCart}
            />
          )}
        </div>
      </div>

      {/* Edit Cart Info Dialog */}
      <Dialog
        open={isEditCartDialogOpen}
        onOpenChange={setIsEditCartDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin giỏ hàng</DialogTitle>
            <DialogDescription>
              Cập nhật tên và thời gian hết hạn của giỏ hàng
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = formData.get("title") as string;
              const expiresAt = formData.get("expiresAt") as string;
              handleUpdateCartInfo({
                title: title.trim(),
                expiresAt: new Date(expiresAt).toISOString(),
              });
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tên giỏ hàng *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={currentCart.title}
                  required
                  disabled={isLoadingDetail}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expiresAt">Hạn sử dụng *</Label>
                <Input
                  id="edit-expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  defaultValue={new Date(currentCart.expiresAt)
                    .toISOString()
                    .slice(0, 16)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  disabled={isLoadingDetail}
                />
                <p className="text-xs text-muted-foreground">
                  Giỏ hàng sẽ tự động đóng sau thời gian này
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditCartDialogOpen(false)}
                disabled={isLoadingDetail}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoadingDetail}>
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
