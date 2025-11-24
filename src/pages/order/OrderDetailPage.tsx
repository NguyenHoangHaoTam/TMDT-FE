import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  X,
  CheckCircle2,
  Truck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getOrderDetail,
  cancelOrder,
  confirmReceived,
  type OrderStatus,
} from "@/service/order/service";
import { getSharedCartDetail } from "@/service/shared-cart/service";
import { formatMoney } from "@/utils/helper";
import toast from "react-hot-toast";

const statusConfig: Record<
  OrderStatus,
  { 
    label: string; 
    color: string; 
    bgColor: string; 
    icon: React.ReactNode;
    description: string;
  }
> = {
  PENDING: {
    label: "Chờ xử lý",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: <Package className="h-4 w-4" />,
    description: "Đơn hàng đang chờ được xử lý bởi cửa hàng",
  },
  PAID: {
    label: "Chờ nhận hàng",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <Package className="h-4 w-4" />,
    description: "Đơn hàng đã sẵn sàng giao hàng. Vui lòng chờ nhận hàng và xác nhận khi đã nhận được.",
  },
  SHIPPED: {
    label: "Chờ nhận hàng",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <Truck className="h-4 w-4" />,
    description: "Đơn hàng đang được vận chuyển đến bạn. Vui lòng chờ nhận hàng và xác nhận khi đã nhận được.",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Đơn hàng đã được giao thành công và hoàn tất",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <X className="h-4 w-4" />,
    description: "Đơn hàng đã bị hủy",
  },
};

const paymentMethodLabels: Record<string, string> = {
  VNPAY: "VNPay",
  COD: "Thanh toán khi nhận hàng (COD)",
  MOMO: "MoMo",
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderDetail(orderId!),
    enabled: !!orderId,
  });

  // Fetch shared cart detail if this is a shared cart order to get payment info (paidBy, paidByName)
  const {
    data: sharedCart,
  } = useQuery({
    queryKey: ["shared-cart", order?.sharedCartId],
    queryFn: () => getSharedCartDetail(order!.sharedCartId!),
    enabled: !!order?.sharedCartId && !!orderId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      setShowCancelDialog(false);
    },
  });

  const confirmReceivedMutation = useMutation({
    mutationFn: () => confirmReceived(orderId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["personal-order-history"] });
      queryClient.invalidateQueries({ queryKey: ["shared-order-history"] });
    },
  });

  const handleCancel = () => {
    if (!order) return;
    if (order.status !== "PENDING" && order.status !== "PAID") {
      toast.error("Chỉ có thể hủy đơn hàng ở trạng thái Chờ xử lý hoặc Đã thanh toán");
      return;
    }
    setShowCancelDialog(true);
  };

  const handleConfirmReceived = () => {
    if (!order) return;
    
    // Validate: Chỉ cho phép xác nhận khi:
    // 1. Status = PAID và paymentMethod = VNPAY
    // 2. Status = SHIPPED (backward compatible)
    if (order.status === "PAID" && isVNPay) {
      // OK: VNPay đã thanh toán trước, user có thể xác nhận ngay
      confirmReceivedMutation.mutate();
    } else if (order.status === "SHIPPED") {
      // OK: Backward compatible
      confirmReceivedMutation.mutate();
    } else if (order.status === "PAID" && isCOD) {
      toast.error("Với phương thức COD, bạn không thể tự xác nhận. Vui lòng chờ admin xác nhận đã giao hàng.");
    } else {
      toast.error(`Chỉ có thể xác nhận đơn hàng đã được thanh toán (PAID - VNPay) hoặc đang giao hàng (SHIPPED). Trạng thái hiện tại: ${statusInfo.label}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-gray-600">Không thể tải chi tiết đơn hàng</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status];
  const canCancel = order.status === "PENDING" || order.status === "PAID";
  
  // Logic cho COD và VNPay
  const isCOD = order.payment?.paymentMethod === "COD";
  const isVNPay = order.payment?.paymentMethod === "VNPAY";
  const isPaymentSuccess = order.payment?.status === "SUCCESS";
  
  // Với COD, chỉ coi là thanh toán thành công khi đơn hàng đã COMPLETED
  const actualPaymentStatus = isCOD 
    ? (order.status === "COMPLETED" && isPaymentSuccess ? "SUCCESS" : "PENDING")
    : (isPaymentSuccess ? "SUCCESS" : "PENDING");

  // Logic xác nhận nhận hàng:
  // - VNPay: Có thể xác nhận khi PAID (đã thanh toán trước)
  // - COD: Không thể tự xác nhận (chỉ admin mới xác nhận giao hàng)
  // - Backward compatible: Vẫn hỗ trợ xác nhận từ SHIPPED
  const canConfirmReceived = 
    (order.status === "PAID" && isVNPay) || 
    (order.status === "SHIPPED");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết đơn hàng #{order.id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Đặt hàng lúc {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6 space-y-2">
        <Badge
          className={`${statusInfo.bgColor} ${statusInfo.color} border-0 px-4 py-2 text-sm font-medium flex items-center gap-2 w-fit`}
        >
          {statusInfo.icon}
          {statusInfo.label}
        </Badge>
        <p className="text-sm text-gray-600">
          {order.status === "PAID" && isCOD
            ? "Đơn hàng đang được xử lý. Bạn sẽ thanh toán khi nhận hàng. Vui lòng chờ nhận hàng và xác nhận khi đã nhận được."
            : order.status === "PAID" && isVNPay
            ? "Đơn hàng đã được thanh toán. Vui lòng chờ nhận hàng và xác nhận khi đã nhận được."
            : statusInfo.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sản phẩm
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <img
                    src={item.productThumbnail || "/placeholder-product.jpg"}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 hover:text-green-600 cursor-pointer"
                        onClick={() => navigate(`/products/${item.productSlug || item.productId}`)}>
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {formatMoney(item.subtotal)}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Info */}
          {order.payment && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thông tin thanh toán
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium">
                    {paymentMethodLabels[order.payment.paymentMethod] ||
                      order.payment.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-medium text-green-600">
                    {formatMoney(order.payment.amount)}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <Badge
                    className={
                      actualPaymentStatus === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {actualPaymentStatus === "SUCCESS" 
                      ? "Thành công" 
                      : isCOD 
                        ? "Chờ thanh toán khi nhận hàng"
                        : "Chờ xử lý"}
                  </Badge>
                </div>
                {order.payment.paidAt && actualPaymentStatus === "SUCCESS" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thanh toán lúc:</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(order.payment.paidAt)}
                    </span>
                  </div>
                )}
                {isCOD && actualPaymentStatus === "PENDING" && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Lưu ý:</strong> Với phương thức COD, bạn sẽ thanh toán khi nhận hàng. 
                      Vui lòng chuẩn bị đủ tiền mặt khi nhận đơn hàng.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.shippingAddress.recipientName}</p>
                <p className="text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.detail}, {order.shippingAddress.ward},{" "}
                  {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatMoney(order.totalAmount)}đ</span>
              </div>
              {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-green-600">
                    -{formatMoney(order.discountAmount)}đ
                  </span>
                </div>
              )}
              {order.couponCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mã giảm giá:</span>
                  <Badge variant="outline">{order.couponCode}</Badge>
                </div>
              )}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600 text-lg">
                    {formatMoney(order.totalAmount)}đ
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Thông tin đơn hàng
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Loại đơn:</span>
                <p className="font-medium mt-1">
                  {order.orderType === "SINGLE"
                    ? "Đơn hàng cá nhân"
                    : order.orderType === "GROUP"
                    ? "Đơn hàng nhóm"
                    : "Đơn hàng giỏ hàng chung"}
                </p>
              </div>
              {order.sharedCartTitle && (
                <div>
                  <span className="text-gray-600">Giỏ hàng chung:</span>
                  <p className="font-medium mt-1">{order.sharedCartTitle}</p>
                </div>
              )}
              {sharedCart?.paymentInfo && (
                <div>
                  <span className="text-gray-600">Người thanh toán:</span>
                  <p className="font-medium mt-1">{sharedCart.paymentInfo.paidByName}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Ngày đặt:</span>
                <p className="font-medium mt-1">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            {canCancel && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Hủy đơn hàng
                  </>
                )}
              </Button>
            )}
            {canConfirmReceived && (
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  onClick={handleConfirmReceived}
                  disabled={confirmReceivedMutation.isPending}
                >
                  {confirmReceivedMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Xác nhận đã nhận hàng
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Vui lòng kiểm tra hàng hóa trước khi xác nhận
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng #{order.id}? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

