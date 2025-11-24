import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import LoadingBtn from "@/components/common/loading-btn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CouponDTO, CouponFormValues } from "@/types/coupon.type";

type CouponFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (values: CouponFormValues) => Promise<unknown> | void;
  onUpdate: (id: number, values: CouponFormValues) => Promise<unknown> | void;
  coupon?: CouponDTO | null;
  isSubmitting?: boolean;
};

const defaultValues: CouponFormValues = {
  code: "",
  description: "",
  discountValue: "",
  isPercent: true,
  usageLimit: "",
  validFrom: "",
  validTo: "",
};

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

export default function CouponForm({
  isOpen,
  onClose,
  coupon,
  onCreate,
  onUpdate,
  isSubmitting,
}: CouponFormProps) {
  const [formValues, setFormValues] = useState<CouponFormValues>(defaultValues);

  const isEditMode = useMemo(() => Boolean(coupon), [coupon]);

  useEffect(() => {
    if (coupon) {
      setFormValues({
        code: coupon.code ?? "",
        description: coupon.description ?? "",
        discountValue: coupon.discountValue
          ? String(coupon.discountValue)
          : "",
        isPercent: coupon.isPercent,
        usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
        validFrom: toDateTimeLocal(coupon.validFrom),
        validTo: toDateTimeLocal(coupon.validTo),
      });
    } else {
      setFormValues(defaultValues);
    }
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditMode && coupon) {
      await onUpdate(coupon.id, formValues);
    } else {
      await onCreate(formValues);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-2xl p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {isEditMode ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá mới"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? "Điều chỉnh thông tin mã giảm giá đang hoạt động"
                : "Định nghĩa điều kiện áp dụng và thời gian hiệu lực"}
            </p>
          </div>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid max-h-[75vh] grid-cols-1 gap-5 overflow-y-auto md:grid-cols-2"
        >
          <div className="space-y-2">
            <Label>Mã giảm giá</Label>
            <Input
              value={formValues.code}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  code: event.target.value.toUpperCase(),
                }))
              }
              placeholder="PICNIC50"
              required
            />
            <p className="text-xs text-muted-foreground">
              Mã sẽ được chuyển sang chữ in hoa tự động.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Loại giảm</Label>
            <Select
              value={formValues.isPercent ? "percent" : "amount"}
              onValueChange={(value) =>
                setFormValues((prev) => ({
                  ...prev,
                  isPercent: value === "percent",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn hình thức giảm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Theo phần trăm (%)</SelectItem>
                <SelectItem value="amount">Theo số tiền (₫)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mức giảm</Label>
            <Input
              type="number"
              min={0}
              step={formValues.isPercent ? "1" : "1000"}
              value={formValues.discountValue}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  discountValue: event.target.value,
                }))
              }
              placeholder={formValues.isPercent ? "VD: 10" : "VD: 50000"}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formValues.isPercent
                ? "Giá trị phần trăm, tối đa 100"
                : "Nhập số tiền giảm theo VND"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Giới hạn lượt sử dụng</Label>
            <Input
              type="number"
              min={1}
              value={formValues.usageLimit}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  usageLimit: event.target.value,
                }))
              }
              placeholder="VD: 100"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Mô tả</Label>
            <Textarea
              value={formValues.description}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={3}
              placeholder="Mô tả điều kiện áp dụng (tùy chọn)"
            />
          </div>

          <div className="space-y-2">
            <Label>Ngày bắt đầu</Label>
            <Input
              type="datetime-local"
              value={formValues.validFrom}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  validFrom: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Ngày kết thúc</Label>
            <Input
              type="datetime-local"
              value={formValues.validTo}
              min={formValues.validFrom}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  validTo: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoadingBtn />}
              {isEditMode ? "Lưu thay đổi" : "Tạo mã"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

