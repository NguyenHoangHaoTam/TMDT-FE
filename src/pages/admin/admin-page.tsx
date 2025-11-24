import { useState, useEffect, type ReactNode } from "react";
import {
  BarChart,
  ChevronLeft,
  Star,
  Award,
  CreditCard,
  Utensils,
  Menu,
  BoxIcon,
  User,
  ListOrdered,
  LogOut,
  TicketPercent,
  HandCoins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminAuthStore } from "@/store/use-admin-auth.store";
import toast from "react-hot-toast";
import { logout } from "@/service/auth/service";
import { useNavigate, useLocation } from "react-router-dom";

type MainLayoutProps = {
  children: ReactNode;
};

export default function AdminSidebar({ children }: MainLayoutProps) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, clearAuth, token, refreshToken } = useAdminAuthStore();

  // Tự động sync activeSection với URL hiện tại
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === "/admin" || pathname === "/admin/") {
      setActiveSection("dashboard");
    } else if (pathname === "/admin/product-manage") {
      setActiveSection("product-manage");
    } else if (pathname === "/admin/user-manage") {
      setActiveSection("user-manage");
    } else if (pathname === "/admin/order-manage") {
      setActiveSection("order-manage");
    } else if (pathname === "/admin/review-manage") {
      setActiveSection("review-manage");
    } else if (pathname === "/admin/coupon-manage") {
      setActiveSection("coupon-manage");
    } else if (pathname === "/admin/group-buy-manage") {
      setActiveSection("group-buy-manage");
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      <div
        className={`${
          isMobile
            ? "fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out"
            : "w-64"
        } ${
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        } bg-white border-r border-gray-200 flex flex-col`}
      >
        {isMobile && (
          <div className="flex justify-end p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-purple-600">ADMIN</h1>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            <button
              onClick={() => {
                setActiveSection("dashboard");
                navigate("/admin");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "dashboard"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BarChart className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveSection("product-manage");
                navigate("/admin/product-manage");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium cursor-pointer rounded-r-md ${
                activeSection === "product-manage"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BoxIcon className="mr-3 h-5 w-5" />
              Quản lý sản phẩm
            </button>
            <button
              onClick={() => {
                setActiveSection("user-manage");
                navigate("/admin/user-manage");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "user-manage"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <User className="mr-3 h-5 w-5" />
              Quản lý người dùng
            </button>
            <button
              onClick={() => {
                setActiveSection("order-manage");
                navigate("/admin/order-manage");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "order-manage"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ListOrdered className="mr-3 h-5 w-5" />
              Quản lý đơn hàng
            </button>
            <button
              onClick={() => {
                setActiveSection("review-manage");
                navigate("/admin/review-manage");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "review-manage"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Star className="mr-3 h-5 w-5" />
              Quản lý đánh giá
            </button>
            <button
              onClick={() => {
                setActiveSection("coupon-manage");
                navigate("/admin/coupon-manage");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "coupon-manage"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <TicketPercent className="mr-3 h-5 w-5" />
              Quản lý mã giảm giá
            </button>
            <button
              onClick={() => {
                setActiveSection("group-buy-manage");
                navigate("/admin/group-buy-manage");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "group-buy-manage"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <HandCoins className="mr-3 h-5 w-5" />
              Quản lý mua chung
            </button>
            <button
              onClick={() => setActiveSection("customer-review")}
              className={`flex opacity-0 items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "customer-review"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Star className="mr-3 h-5 w-5" />
              Customer Review
            </button>
            <button
              onClick={() => setActiveSection("billing")}
              className={`flex opacity-0 items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "billing"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <CreditCard className="mr-3 h-5 w-5" />
              Billing System
            </button>
            <button
              onClick={() => setActiveSection("food-delivery")}
              className={`flex opacity-0 items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "food-delivery"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Utensils className="mr-3 h-5 w-5" />
              Food Delivery
            </button>
            <button
              onClick={() => setActiveSection("premium")}
              className={`flex opacity-0 items-center w-full px-4 py-3 text-sm font-medium rounded-r-md ${
                activeSection === "premium"
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Award className="mr-3 h-5 w-5" />
              Try Premium Version
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gray-800">
              {activeSection === "dashboard"
                ? "Dashboard"
                : activeSection === "product-manage"
                ? "Quản lý sản phẩm"
                : activeSection === "user-manage"
                ? "Quản lý người dùng"
                : activeSection === "order-manage"
                ? "Quản lý đơn hàng"
                : activeSection === "review-manage"
                ? "Quản lý đánh giá"
                : activeSection === "coupon-manage"
                ? "Quản lý mã giảm giá"
                : activeSection === "group-buy-manage"
                ? "Quản lý mua chung"
                : "Admin Panel"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Hiển thị username admin và nút đăng xuất */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 hidden md:inline">
                {admin?.name || "Admin"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
                        alt="Admin"
                      />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {admin?.name?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {admin?.name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {admin?.email || ""}
                    </p>
                  </div>
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        // Gọi API logout để xóa token trên backend và xóa cookie
                        await logout(token, refreshToken);
                        // Xóa token ở frontend
                        clearAuth();
                        toast.success("Đăng xuất thành công!");
                        navigate("/admin/login");
                      } catch (e) {
                        console.error("Logout error:", e);
                        // Vẫn xóa token ở frontend ngay cả khi API logout thất bại
                        clearAuth();
                        toast.success("Đăng xuất thành công!");
                        navigate("/admin/login");
                      }
                    }}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {/* {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "billing" && renderBillingSystem()}
          {activeSection === "food-delivery" && renderFoodDelivery()}
          {activeSection === "product-manage"} 
          {activeSection !== "dashboard" &&
            activeSection !== "billing" &&
            activeSection !== "food-delivery" && (
              <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                      This section is under development and will be available
                      soon.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      The{" "}
                      {activeSection === "check-in-out"
                        ? "Check In-Out"
                        : activeSection === "rooms"
                        ? "Rooms"
                        : activeSection === "messages"
                        ? "Messages"
                        : activeSection === "customer-review"
                        ? "Customer Review"
                        : "Premium"}{" "}
                      module is currently being built. Please check back later.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => setActiveSection("dashboard")}>
                      Return to Dashboard
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )} */}
          {children}
        </main>
      </div>
    </div>
  );
}
