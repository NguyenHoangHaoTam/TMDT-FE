import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Layers } from "lucide-react";

export type TopSellingProduct = {
  productId: number;
  productName: string;
  unitsSold: number;
  revenue: number;
};

export type CategorySales = {
  categoryName: string;
  productsSold: number;
};

export default function TopListTabs({
  products,
  categories,
}: {
  products?: TopSellingProduct[];
  categories?: CategorySales[];
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <Card className="w-full  border-border shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-lg font-bold text-foreground">
          Top thống kê
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="product" className="w-full">
          <div className="border-b border-border px-0 pt-4">
            <TabsList className="inline-flex gap-1 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="product"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2 font-medium text-sm text-muted-foreground data-[state=active]:text-foreground transition-colors"
              >
                <Package className="h-4 w-4 mr-2" />
                Sản phẩm bán chạy
              </TabsTrigger>

              <TabsTrigger
                value="category"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2 font-medium text-sm text-muted-foreground data-[state=active]:text-foreground transition-colors"
              >
                <Layers className="h-4 w-4 mr-2" />
                Danh mục bán chạy
              </TabsTrigger>
            </TabsList>
          </div>

          {/* PRODUCT TAB */}
          <TabsContent value="product" className="m-0">
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 px-6 py-3 bg-muted/30 font-semibold text-sm text-muted-foreground">
                <div className="w-12 text-center">STT</div>
                <div className="w-20">ID</div>
                <div className="flex-1">Tên sản phẩm</div>
                <div className="w-32 text-right">Đã bán</div>
                <div className="w-40 text-right">Doanh thu</div>
              </div>

              {products?.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors duration-200"
                >
                  <div className="w-12 text-center">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs mx-auto">
                      {index + 1}
                    </div>
                  </div>
                  <div className="w-20 text-sm text-muted-foreground font-medium">
                    #{product.productId}
                  </div>
                  <div className="flex-1 text-foreground font-medium truncate">
                    {product.productName}
                  </div>
                  <div className="w-32 text-right text-sm font-semibold text-foreground">
                    {formatNumber(product.unitsSold)}
                  </div>
                  <div className="w-40 text-right text-sm font-semibold text-primary">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* CATEGORY TAB */}
          <TabsContent value="category" className="m-0">
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 px-6 py-3 bg-muted/30 font-semibold text-sm text-muted-foreground">
                <div className="w-12 text-center">STT</div>
                <div className="flex-1">Tên danh mục</div>
                <div className="w-40 text-right">Số sản phẩm bán</div>
              </div>

              {categories?.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors duration-200"
                >
                  <div className="w-12 text-center">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs mx-auto">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 text-foreground font-medium">
                    {category.categoryName}
                  </div>
                  <div className="w-40 text-right text-sm font-semibold text-foreground">
                    {formatNumber(category.productsSold)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
