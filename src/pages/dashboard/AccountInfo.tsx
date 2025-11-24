import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles,
  Crown,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  ShoppingBag,
  Gift,
  LogOut,
  ShieldCheck,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  X,
} from "lucide-react";
import { getAddresses, getProfile } from "@/service/user/service";
import { logout } from "@/service/auth/service";
import {
  getPersonalOrderHistory,
  type OrderSummary,
  type OrderStatus,
} from "@/service/order/service";
import { useAuthStore } from "@/store/use-auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/utils/helper";

const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: ReactNode;
  }
> = {
  PENDING: {
    label: "Chờ xử lý",
    color: "text-amber-700",
    bg: "bg-amber-50",
    icon: <Clock size={16} />,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "text-blue-700",
    bg: "bg-blue-50",
    icon: <Package size={16} />,
  },
  SHIPPED: {
    label: "Đang giao",
    color: "text-blue-700",
    bg: "bg-blue-50",
    icon: <Truck size={16} />,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: <CheckCircle2 size={16} />,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-rose-700",
    bg: "bg-rose-50",
    icon: <X size={16} />,
  },
};

export default function AccountInfo() {
  const { user, setUser, clearAuth, token, refreshToken } = useAuthStore();
  const [profile, setProfile] = useState<any>(user ?? null);
  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const userId = user?.id;

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setAddressesLoading(true);
      try {
        const [profileRes, addressRes] = await Promise.all([
          getProfile().catch(() => null),
          getAddresses().catch(() => []),
        ]);
        if (!active) return;
        const resolvedProfile = profileRes ?? user ?? null;
        setProfile(resolvedProfile);
        if (profileRes && setUser) {
          setUser(profileRes);
        }
        setAddresses(Array.isArray(addressRes) ? addressRes : []);
      } catch (err) {
        console.error("Load account info failed", err);
      } finally {
        if (!active) return;
        setLoading(false);
        setAddressesLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [setUser, userId]);
  useEffect(() => {
    const updated = searchParams.get("addressUpdated");
    if (!updated) return;
    toast.success("Cập nhật địa chỉ giao hàng thành công");
    setAddressesLoading(true);
    getAddresses()
      .then((list) => {
        setAddresses(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Refresh addresses failed", err);
      })
      .finally(() => {
        setAddressesLoading(false);
        const next = new URLSearchParams(searchParams);
        next.delete("addressUpdated");
        setSearchParams(next, { replace: true });
      });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setOrders([]);
      return;
    }
    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const history = await getPersonalOrderHistory();
        if (!mounted) return;
        setOrders(history?.orders ?? []);
      } catch (error) {
        console.error("Load personal orders failed", error);
        if (!mounted) return;
        setOrders([]);
      } finally {
        if (!mounted) return;
        setOrdersLoading(false);
      }
    };
    loadOrders();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const displayPhone = useMemo(() => {
    return (
      profile?.phone ??
      profile?.phoneNumber ??
      profile?.mobile ??
      profile?.numberPhone ??
      null
    );
  }, [profile]);

  const formatOrderDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const totalOrders =
    profile?.orderCount ?? profile?.totalOrders ?? orders.length;
  const hasAddress = addresses.length > 0;
  const defaultAddress = useMemo(
    () => addresses.find((addr) => addr?.isDefault),
    [addresses]
  );
  const otherAddresses = useMemo(
    () => addresses.filter((addr) => !addr?.isDefault),
    [addresses]
  );
  const primaryPhone = useMemo(() => {
    return (
      displayPhone ||
      defaultAddress?.phone ||
      defaultAddress?.phoneNumber ||
      defaultAddress?.mobile ||
      null
    );
  }, [displayPhone, defaultAddress]);
  const displayName = useMemo(() => {
    if (profile?.fullName) return profile.fullName;
    if (profile?.name) return profile.name;
    if (profile?.username) return profile.username;
    if (defaultAddress?.fullName) return defaultAddress.fullName;
    if (profile?.email && typeof profile.email === "string") {
      const local = profile.email.split("@")[0];
      return local || "—";
    }
    return "—";
  }, [profile, defaultAddress]);

  const loyaltyTier = useMemo(() => {
    const tier = profile?.tier || profile?.membershipLevel;
    if (tier) return tier;
    if ((profile?.totalSpending ?? 0) > 5_000_000) return "Hạng Vàng";
    if ((profile?.totalSpending ?? 0) > 1_000_000) return "Hạng Bạc";
    return "Thành viên";
  }, [profile]);

  const goToOrderTracking = useCallback(() => {
    navigate("/order-tracking");
  }, [navigate]);

  const goToAddressManager = useCallback(() => {
    navigate("/account/addresses?redirect=/account");
  }, [navigate]);

  const summaryStats = useMemo(
    () => [
      {
        label: "Đơn đã đặt",
        value: totalOrders,
        icon: ShoppingBag,
        accent: "bg-emerald-50 text-emerald-600",
        action: goToOrderTracking,
      },
      {
        label: "Địa chỉ",
        value: addresses.length,
        icon: MapPin,
        accent: "bg-sky-50 text-sky-600",
        action: goToAddressManager,
      },
    ],
    [addresses.length, goToAddressManager, goToOrderTracking, totalOrders]
  );

  const handleLogout = async () => {
    try {
      // Gọi API logout để xóa token trên backend và xóa cookie
      await logout(token, refreshToken);
      // Xóa token ở frontend
      clearAuth?.();
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (e) {
      console.warn("Logout error", e);
      // Vẫn xóa token ở frontend ngay cả khi API logout thất bại
      clearAuth?.();
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)] bg-gradient-to-br from-emerald-50 via-white to-lime-100">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_55%)]" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[70%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-emerald-200/40 via-transparent to-lime-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_55%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
            <div className="relative">
              <div className="h-28 w-28 rounded-3xl border border-white/50 bg-white/10 p-1 shadow-xl backdrop-blur">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-white/90 via-white/70 to-white/40 text-4xl font-semibold text-emerald-600">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="avatar"
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    (profile?.fullName || profile?.name || "U")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-lg">
                <Sparkles size={14} />
                {loyaltyTier}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-wide">
                  {displayName || "Khách hàng thân thiết"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  Tài khoản bảo mật
                </span>
              </div>
              <p className="max-w-2xl text-sm text-emerald-50/90">
                Cảm ơn bạn đã đồng hành cùng Picnic. Hãy cập nhật thông tin để
                nhận ưu đãi và giao hàng nhanh chóng hơn.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-emerald-50">
                <div className="inline-flex items-center gap-2">
                  <Mail size={16} className="text-white/80" />
                  {profile?.email || "Chưa có email"}
                </div>
                {displayPhone && (
                  <div className="inline-flex items-center gap-2">
                    <Phone size={16} className="text-white/80" />
                    {primaryPhone}
                  </div>
                )}
                {profile?.createdAt && (
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays size={16} className="text-white/80" />
                    Gia nhập{" "}
                    {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-col gap-3">
              <Button
                onClick={goToAddressManager}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 font-semibold text-emerald-600 shadow-lg hover:bg-white"
              >
                <MapPin size={16} />
                Cập nhật địa chỉ
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 font-semibold text-white hover:bg-white/25"
              >
                <LogOut size={16} />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-0 bg-white shadow-xl shadow-emerald-100/70">
              <CardContent className="p-0">
                <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-emerald-50/60 to-transparent">
                  <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-emerald-700">
                    <Crown size={18} className="text-emerald-500" />
                    Tổng quan tài khoản
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Cập nhật và kiểm tra thông tin cá nhân của bạn để Picnic
                    phục vụ tốt hơn.
                  </p>
                </div>
                <div className="grid gap-6 px-6 py-6 text-sm sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500">
                      Họ và tên
                    </div>
                    <div className="text-[15px] font-semibold text-gray-900">
                      {displayName}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500">
                      Email
                    </div>
                    <div className="text-[15px] text-gray-800">
                      {profile?.email || "—"}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500">
                      Số điện thoại
                    </div>
                    <div className="text-[15px] text-gray-800">
                      {primaryPhone || "—"}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500">
                      Trạng thái
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      <ShieldCheck size={14} />
                      Đang hoạt động
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 bg-white shadow-xl shadow-emerald-100/70">
              <CardContent className="p-0">
                <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-emerald-50/60 to-transparent">
                  <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-emerald-700">
                    <MapPin size={18} className="text-emerald-500" />
                    Địa chỉ giao hàng
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Quản lý địa chỉ yêu thích và cập nhật để nhận hàng nhanh
                    hơn.
                  </p>
                </div>

                {addressesLoading ? (
                  <div className="px-6 py-8 text-sm text-gray-500">
                    Đang tải địa chỉ...
                  </div>
                ) : hasAddress ? (
                  <div className="space-y-6 px-6 py-6">
                    {defaultAddress && (
                      <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-emerald-700">
                            <MapPin size={16} className="text-emerald-600" />
                            Địa chỉ mặc định
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-emerald-700 shadow ring-1 ring-emerald-200/70">
                            <Sparkles size={14} />
                            Ưu tiên giao hàng
                          </span>
                        </div>
                        <div className="mt-3 text-[15px] text-gray-800">
                          {defaultAddress.detail ||
                            defaultAddress.addressLine ||
                            defaultAddress.fullAddress ||
                            "Không có địa chỉ chi tiết"}
                        </div>
                        <div className="mt-2 text-[12px] text-gray-500">
                          {[
                            defaultAddress.ward,
                            defaultAddress.district,
                            defaultAddress.city,
                            defaultAddress.province,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                        <div className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-emerald-700">
                          <Phone size={14} />
                          {defaultAddress.phone ||
                            defaultAddress.phoneNumber ||
                            defaultAddress.mobile ||
                            displayPhone ||
                            "—"}
                        </div>
                      </div>
                    )}

                    {otherAddresses.length > 0 && (
                      <div className="space-y-3.5">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          Các địa chỉ khác
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {otherAddresses.map((addr) => (
                            <div
                              key={
                                addr.id ??
                                `${addr.addressLine}-${addr.phone ?? ""}`
                              }
                              className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition-shadow hover:shadow-md"
                            >
                              <div className="text-[15px] font-semibold text-gray-900">
                                {addr.fullName ||
                                  profile?.fullName ||
                                  "Người nhận"}
                              </div>
                              <div className="text-[12px] text-gray-500">
                                {addr.phone ||
                                  addr.phoneNumber ||
                                  addr.mobile ||
                                  displayPhone ||
                                  "—"}
                              </div>
                              <div className="mt-2 text-[15px] text-gray-700">
                                {addr.addressLine ||
                                  addr.detail ||
                                  addr.fullAddress ||
                                  "Không có địa chỉ chi tiết"}
                              </div>
                              <div className="mt-2 text-[12px] text-gray-500">
                                {[
                                  addr.ward,
                                  addr.district,
                                  addr.city,
                                  addr.province,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-6 py-6">
                    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-6 py-5 text-sm text-emerald-700">
                      Bạn chưa có địa chỉ giao hàng nào. Bấm "Cập nhật địa chỉ"
                      để thêm địa chỉ mặc định.
                    </div>
                  </div>
                )}

                {/* Footer quản lý địa chỉ đã được loại bỏ vì đã có nút ở phần đầu trang */}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="border-0 bg-white/80 shadow-xl shadow-emerald-100/70 backdrop-blur">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-emerald-700">
                  <Sparkles size={18} className="text-emerald-500" />
                  Hiệu suất mua sắm
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {summaryStats.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.action}
                      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/90 to-white px-4 py-4 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/40 blur-2xl" />
                      <div className="relative flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ring-1 ring-inset ring-black/5 ${item.accent}`}
                        >
                          <item.icon size={20} />
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-gray-500">
                            {item.label}
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {item.value ?? 0}
                          </div>
                        </div>
                        <ArrowRight className="ml-auto h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 shadow-xl shadow-emerald-100/70 backdrop-blur">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-emerald-700">
                  <ShoppingBag size={18} className="text-emerald-500" />
                  Đơn hàng gần đây
                </div>

                {ordersLoading ? (
                  <div className="text-sm text-gray-500">Đang tải đơn hàng...</div>
                ) : recentOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-emerald-200/70 bg-emerald-50/60 px-5 py-6 text-sm text-emerald-700">
                    Bạn chưa có đơn hàng nào. Khi bắt đầu mua sắm, đơn gần nhất sẽ hiển thị tại đây.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const meta =
                        ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.PENDING;
                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="group flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.bg} ${meta.color}`}
                          >
                            {meta.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                              <span>Đơn #{order.id}</span>
                              <span className="text-emerald-600">
                                {formatMoney(order.totalAmount)}đ
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {formatOrderDate(order.createdAt)}
                            </div>
                            <span
                              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.color}`}
                            >
                              {meta.icon}
                              {meta.label}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-gray-500">
                    {orders.length > 0
                      ? `Hiển thị ${recentOrders.length}/${orders.length} đơn gần nhất`
                      : "Chưa có dữ liệu đơn hàng để hiển thị"}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => navigate("/products")}
                    >
                      Tiếp tục mua sắm
                    </Button>
                    <Button
                      className="bg-emerald-500 text-white hover:bg-emerald-600"
                      onClick={goToOrderTracking}
                      disabled={ordersLoading && orders.length === 0}
                    >
                      Xem tất cả đơn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/85 shadow-xl shadow-emerald-100/70 backdrop-blur">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-emerald-700">
                  <Gift size={18} className="text-emerald-500" />
                  Ưu đãi dành riêng
                </div>
                <p className="text-sm text-gray-600">
                  Kết nối với Picnic để nhận thông báo ưu đãi, mã giảm giá và
                  tin tức sản phẩm theo sở thích của bạn.
                </p>
                <ul className="space-y-3 text-[15px] text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Đơn hàng trên 500.000đ được giao nhanh miễn phí trong nội
                    thành.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Nhận mã ưu đãi sinh nhật dành riêng cho thành viên thân
                    thiết.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Tích luỹ điểm thưởng để đổi quà và voucher mua sắm.
                  </li>
                </ul>
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                >
                  Khám phá ưu đãi
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {loading && (
          <div className="mt-8 text-sm text-gray-500">
            Đang tải dữ liệu tài khoản...
          </div>
        )}
      </div>
    </div>
  );
}
