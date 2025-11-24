import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, LockIcon, User2 } from "lucide-react";
import BackgroundAnimated from "@/components/common/auth/bg-animated";
import BackgroundBottomImg from "@/components/common/auth/bg-bottom-img";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/utils/validation/auth-schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminLogin } from "@/hook/admin/use-admin-auth";
import LoadingBtn from "@/components/common/loading-btn";

type FormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { login, isPending } = useAdminLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      login({ username: data.username, password: data.password });
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-100 via-blue-50 to-indigo-100">
      <BackgroundAnimated />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-indigo-200/20 backdrop-blur-sm bg-white/95 animate-fade-in-up">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Shield className="text-white" size={40} />
            </div>
            <CardTitle className="text-3xl font-bold text-indigo-700 text-balance">
              Đăng nhập Admin
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Vui lòng đăng nhập để truy cập hệ thống quản trị
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-foreground font-medium flex"
                >
                  <User2 size={15} className="text-gray-600" />
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Tên đăng nhập admin"
                  {...register("username")}
                  className="h-11 border-2 border-input mb-0  focus:border-indigo-600 transition-colors duration-300"
                />
                {errors.username && (
                  <p className="px-1 text-sm text-red-600 ">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-foreground font-medium flex"
                >
                  <LockIcon size={15} className="text-gray-600" />
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="h-11 border-2 mb-0 border-input focus:border-indigo-600 transition-colors duration-300"
                />
                {errors.password && (
                  <p className="px-1 text-sm text-red-600 ">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-input accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Button
                disabled={isPending}
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                {isPending && <LoadingBtn />}
                Đăng nhập Admin
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Bạn là người dùng?{" "}
                <a
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Đăng nhập tại đây
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <BackgroundBottomImg />
    </div>
  );
}

