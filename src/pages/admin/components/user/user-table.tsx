"use client";

import { Edit2, Trash2, Lock, LockOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

interface UserTableProps {
  users?: User[];
  onEdit: (user: User) => void;
  onDelete?: (id: number) => void;
  handleClickBlockUser: (user: User, isBlock: boolean) => void;
  searchTerm?: string;
  selectedRole?: string;
}

export default function UserTable({
  users,
  onEdit,
  handleClickBlockUser,
  searchTerm = "",
  selectedRole = "Tất cả",
}: UserTableProps) {
  // Filter users
  const filteredUsers = users?.filter((user) => {
    // Filter by role
    if (selectedRole !== "Tất cả") {
      const normalizedRole = selectedRole.toLowerCase();
      const userRole = user.role?.toLowerCase() || "";
      if (normalizedRole !== userRole) {
        return false;
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      const username = user.username?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      return username.includes(search) || email.includes(search);
    }

    return true;
  }) || [];

  return (
    <div>
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <Users className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              Không có người dùng nào
            </p>
            <p className="text-slate-400 text-sm">
              Thêm người dùng mới để bắt đầu quản lý
            </p>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
            <div className="overflow-hidden">
              <table className="w-full flex-1 min-h-0  overflow-y-auto">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Người Dùng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Vai Trò
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Trạng Thái
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-emerald-50 transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {user.username}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role?.toLowerCase() === "admin"
                            ? "Admin"
                            : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            disabled
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(user)}
                            className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all p-2"
                            title="Sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleClickBlockUser(user, user?.isActive);
                            }}
                            className={`transition-all p-2 ${
                              user.isActive
                                ? "hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 "
                                : "hover:bg-green-50 hover:border-green-300 hover:text-green-700 "
                            }`}
                            title={user.isActive ? "Khóa tài khoản" : "Mở khóa"}
                          >
                            {user.isActive ? (
                              <Lock className="h-4 w-4 text-green-500 " />
                            ) : (
                              <LockOpen className="h-4 w-4 text-amber-700 " />
                            )}
                          </Button>
                          <Button
                            disabled
                            variant="outline"
                            size="sm"
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all text-slate-600 p-2"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
