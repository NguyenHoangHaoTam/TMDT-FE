import { Truck, Clock, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { useManageOrder } from "@/hook/admin/use-order-manage";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import LoadingBtn from "@/components/common/loading-btn";

export function AlertDialogDemo({
  isOpen,
  setIsOpen,
  onClickAction,
  isPending,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClickAction: () => void;
  isPending?: boolean;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Bạn chắc chắn muốn chuyển đổi trạng thái?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={() => onClickAction()}>
            {isPending && <LoadingBtn />}
            Tiếp tục
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function parseOrderDate(dateString: string): Date | null {
  if (!dateString) return null;

  const normalized = dateString.replace(" ", "T");
  const hasTimezone = /[+-]\d{2}:?\d{2}$|Z$/i.test(normalized);

  if (hasTimezone) {
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const [datePart, timePart = "00:00:00"] = normalized.split("T");
  const [year, month, day] = datePart.split(/[-/]/).map(Number);
  const [hour = "0", minute = "0", second = "0"] = timePart.split(":");

  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return null;
  }

  const asUtc = new Date(
    Date.UTC(year, month - 1, Number(day), Number(hour), Number(minute), Number(second))
  );

  // Nếu convert sang UTC mà thời gian nằm >5 phút trong tương lai thì fallback về local
  if (asUtc.getTime() - Date.now() > 5 * 60 * 1000) {
    return new Date(year, month - 1, Number(day), Number(hour), Number(minute), Number(second));
  }

  return asUtc;
}

export function formatOrderDate(dateString: string) {
  const date = parseOrderDate(dateString);
  if (!date) {
    console.error("Invalid date:", dateString);
    return "";
  }
  return format(date, "dd/MM/yyyy");
}

// interface OrderTableProps {
//   orders: Order[];
//   onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
// }

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";

const statusColors: Record<
  OrderStatus,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  PENDING: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    icon: <Clock className="h-4 w-4" />,
  },

  PAID: {
    bg: "bg-green-50",
    text: "text-green-700",
    icon: <CheckCircle className="h-4 w-4" />,
  },

  SHIPPED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: <Truck className="h-4 w-4" />,
  },

  COMPLETED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: <CheckCircle className="h-4 w-4" />,
  },

  CANCELLED: {
    bg: "bg-red-50",
    text: "text-red-700",
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

interface OrderTableProps {
  searchTerm?: string;
  selectedStatus?: string;
}

export default function OrderTable({ searchTerm = "", selectedStatus = "Tất cả" }: OrderTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const { allOrder, editStatusOrder, isPendingEdit } =
    useManageOrder(setIsOpen);
  
  // Map status từ tiếng Việt sang enum
  const mapStatusToEnum = (status: string): OrderStatus | null => {
    switch (status) {
      case "Chờ Xử Lý":
        return "PENDING";
      case "Đang Xử Lý":
        return "PAID";
      case "Đã Gửi":
        return "SHIPPED";
      case "Đã Giao":
        return "COMPLETED";
      case "Đã Hủy":
        return "CANCELLED";
      default:
        return null;
    }
  };

  // Filter orders
  const filteredOrders = allOrder?.content?.filter((order) => {
    // Filter by status
    if (selectedStatus !== "Tất cả") {
      const statusEnum = mapStatusToEnum(selectedStatus);
      if (statusEnum && order.status !== statusEnum) {
        return false;
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      const orderIdStr = order.id.toString();
      // Có thể mở rộng tìm kiếm theo tên, email nếu có trong order
      return orderIdStr.includes(search);
    }

    return true;
  }) || [];

  const sortedOrders = filteredOrders
    .map((order) => ({
      ...order,
      _parsedDate: parseOrderDate(order.createdAt),
    }))
    .sort((a, b) => {
      const timeA = a._parsedDate?.getTime() ?? 0;
      const timeB = b._parsedDate?.getTime() ?? 0;
      if (timeA === timeB) {
        return b.id - a.id;
      }
      return timeB - timeA;
    })
    .map(({ _parsedDate, ...order }) => order);

  function formatOrderType(type: string) {
    switch (type) {
      case "SHARED_CART":
        return "Giỏ hàng chung";
      case "SINGLE":
        return "Giỏ hàng";
      default:
        return type;
    }
  }

  function formatPaymentMethod(method?: string) {
    if (!method) return "--";
    switch (method.toUpperCase()) {
      case "COD":
        return "COD";
      case "VNPAY":
        return "VNPay";
      case "MOMO":
        return "MoMo";
      default:
        return method;
    }
  }

  const onClickAction = () => {
    if (!orderId) return toast.error("Không tìm thấy mẫ đơn hàng");
    else {
      editStatusOrder(orderId);
    }
  };
  return (
    <div className="overflow-hidden">
      <div className="max-h-[600px] overflow-y-auto border rounded-lg">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 sticky top-0 z-10">
            <tr className="text-sm font-semibold text-emerald-900">
              <th className="p-4 text-left">Mã Đơn</th>
              <th className="p-4 text-left">Hình sản phẩm</th>
              <th className="p-4 text-left">Kiểu giỏ hàng</th>
              <th className="p-4 text-left">Tổng Tiền</th>
              <th className="p-4 text-left">Ngày Đặt</th>
              <th className="p-4 text-left">Hình thức thanh toán</th>
              <th className="p-4 text-left">Trạng Thái</th>
              <th className="p-4 text-left">Hành Động</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-muted-foreground"
                >
                  {allOrder?.content?.length === 0 
                    ? "Không có đơn hàng nào" 
                    : "Không tìm thấy đơn hàng phù hợp"}
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-accent transition-colors border-b border-border"
                >
                  {/* Mã đơn */}
                  <td className="p-4 font-medium text-sm">{order.id}</td>

                  {/* Mã đơn */}
                  <td className="p-4 font-medium text-sm">
                    <img
                      src={order?.firstProductThumbnail}
                      alt="ảnh sản phẩm"
                      className="w-40 h-30 object-cover object-center"
                    />
                  </td>
                  {/* Mã đơn */}
                  <td className="p-4 font-medium text-sm">
                    <span>{formatOrderType(order?.orderType)}</span>{" "}
                  </td>

                  {/* Tổng tiền */}
                  <td className="p-4 font-semibold text-emerald-600">
                    {order.totalAmount.toLocaleString("vi-VN")}₫
                  </td>

                  {/* Ngày đặt */}
                  <td className="p-4 text-sm">
                    {order.createdAt ? formatOrderDate(order.createdAt) : "--"}
                  </td>

                  {/* Hình thức thanh toán */}
                  <td className="p-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
                      {formatPaymentMethod(order.paymentMethod)}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="p-4">
                    {(() => {
                      const statusConfig = statusColors[order.status as OrderStatus] || {
                        bg: "bg-gray-50",
                        text: "text-gray-700",
                        icon: <AlertCircle className="h-4 w-4" />,
                      };
                      return (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.icon}
                          {order.status}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Hành động */}
                  <td className="p-4">
                    {order.status === "PAID" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5  hover:bg-muted rounded-lg transition-colors">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setOrderId(order?.id);
                              setIsOpen(true);
                            }}
                          >
                            <Truck className="h-4 w-4 mr-2 text-blue-600" />
                            Chuyển sang SHIPPED
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isOpen && orderId && (
        <AlertDialogDemo
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onClickAction={onClickAction}
          isPending={isPendingEdit}
        />
      )}
    </div>
  );
}
