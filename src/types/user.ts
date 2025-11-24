export interface Address {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
  createdAt: string; // hoặc Date nếu bạn muốn convert
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "locked";
  joinDate: string;
  isActive: boolean;
  avatar: string;
  addresses: Address[];
}

export interface UsersResponse {
  data: User[];
}
