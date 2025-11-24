import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import OrderTable from "../components/order/order-table";

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "Tất cả");

  // Sync URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus && selectedStatus !== "Tất cả") params.set("status", selectedStatus);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedStatus, setSearchParams]);

  const statuses = [
    "Tất cả",
    "Chờ Xử Lý",
    "Đang Xử Lý",
    "Đã Gửi",
    "Đã Giao",
    "Đã Hủy",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản Lý Đơn Hàng
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý và theo dõi các đơn hàng của khách hàng
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng, tên hoặc email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Order Table */}
        <Card className="border-0">
          <OrderTable searchTerm={searchTerm} selectedStatus={selectedStatus} />
        </Card>
      </div>
    </div>
  );
}
