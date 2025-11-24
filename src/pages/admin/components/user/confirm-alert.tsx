import LoadingBtn from "@/components/common/loading-btn";
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
import { cn } from "@/lib/utils";

export function AlertDialogUser({
  id,
  isBlock,
  open,
  setOpen,
  onBlockFn,
  isPending,
}: Readonly<{
  id: number;
  isBlock?: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onBlockFn: (id: number) => void;
  isPending?: boolean;
}>) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBlock ? "Chặn người dùng này?" : " Bỏ chặn người dùng này?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn tài
            khoản của bạn và xóa dữ liệu của bạn khỏi máy chủ của chúng tôi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              "bg-blue-500 cursor-pointer ",
              isBlock && "bg-red-500 hover:bg-red-500"
            )}
            onClick={() => {
              onBlockFn(id);
            }}
          >
            {isPending && <LoadingBtn />}
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
