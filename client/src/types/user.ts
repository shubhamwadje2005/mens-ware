export interface Address {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  addresses: Address[];
  createdAt?: string;
  updatedAt?: string;
}
