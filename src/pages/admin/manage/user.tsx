"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import type { User } from "@/types/user";
import UserTable from "../components/user/user-table";
import { useUserManager } from "@/hook/admin/use-user-manager";
import { AlertDialogUser } from "../components/user/confirm-alert";

export default function UsersManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedRole, setSelectedRole] = useState(searchParams.get("role") || "Tất cả");
  const [, setIsFormOpen] = useState(false);
  const [, setEditingUser] = useState<User | null>(null);
  const [, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User>();
  const [, setIsBlock] = useState<boolean>(false);

  const { users, blockUser, unblockUser, isPendingBlock, isPendingUnBlock } =
    useUserManager();

  const roles = ["Tất cả", "admin", "user"];
  const handleClickBlockUser = (user: User, isBlock: boolean) => {
    setUser(user);
    setOpen(true);
    if (!isBlock) {
      setIsBlock(true);
    } else {
      setIsBlock(false);
    }
  };

  // const handleAddUser = (data: Omit<User, "id" | "joinDate">) => {
  //   const newUser: User = {
  //     ...data,
  //     id: Math.max(...users.map((u) => u.id), 0) + 1,
  //     joinDate: new Date().toISOString().split("T")[0],
  //   };
  //   setUsers([...users, newUser]);
  //   setIsFormOpen(false);
  // };

  // const handleUpdateUser = (data: Omit<User, "id" | "joinDate">) => {
  //   if (editingUser) {
  //     setUsers(
  //       users.map((u) =>
  //         u.id === editingUser.id
  //           ? { ...data, id: u.id, joinDate: u.joinDate }
  //           : u
  //       )
  //     );
  //     setEditingUser(null);
  //     setIsFormOpen(false);
  //   }
  // };

  // const handleDeleteUser = (id: number) => {
  //   setUsers(users.filter((u) => u.id !== id));
  //   if (paginatedUsers.length === 1 && currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  // Sync URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedRole && selectedRole !== "Tất cả") params.set("role", selectedRole);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedRole, setSearchParams]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản Lý Người Dùng
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý tài khoản và quyền hạn người dùng
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingUser(null);
              setIsFormOpen(true);
            }}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Thêm Người Dùng
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 flex-wrap">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedRole === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {role === "admin" ? "Admin" : role === "user" ? "User" : role}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <Card className="border-0">
          <UserTable
            users={users}
            onEdit={handleEditUser}
            // onDelete={handleDeleteUser}
            handleClickBlockUser={handleClickBlockUser}
            searchTerm={searchTerm}
            selectedRole={selectedRole}
          />
        </Card>

        {/* {isFormOpen && (
          <UserForm
            user={editingUser}
            onSubmit={editingUser ? handleUpdateUser : handleAddUser}
            onClose={() => {
              setIsFormOpen(false);
              setEditingUser(null);
            }}
          />
        )} */}

        {open && user?.id && user && (
          <AlertDialogUser
            open={open}
            setOpen={setOpen}
            isBlock={user?.isActive}
            onBlockFn={user?.isActive ? blockUser : unblockUser}
            id={user?.id}
            isPending={isPendingBlock || isPendingUnBlock}
          />
        )}
      </div>
    </div>
  );
}
