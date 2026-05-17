export type User = {
  id: string;
  line_user_id: string;
  display_name: string | null;
  picture_url: string | null;
  created_at: string;
};

export type ClientUser = {
  id: string;
  user_id: string;
  client_id: string;
  role: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  name: string;
  line_user_id: string | null;
  line_display_name: string | null;
  plan_status: string | null;
  created_at: string;
};

export type Shoot = {
  id: string;
  client_id: string;
  title: string;
  shoot_date: string | null;
  status: string;
  memo: string | null;
  created_at: string;
};

export type Asset = {
  id: string;
  client_id: string;
  shoot_id: string | null;
  asset_no: string;
  title: string;
  preview_url: string | null;
  original_url: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  file_type: string;
  credit_cost: number;
  status: "draft" | "selectable" | "requested" | "delivered" | "archived" | string;
  tags: string[] | null;
  month: string | null;
  blob_path: string | null;
  created_at: string;
};

export type AssetRequest = {
  id: string;
  client_id: string;
  shoot_id: string | null;
  status: "pending" | "approved" | "delivered" | string;
  total_credit: number;
  message: string | null;
  delivery_url: string | null;
  delivered_at: string | null;
  created_at: string;
};

export type AssetRequestItem = {
  id: string;
  request_id: string;
  asset_id: string;
  created_at: string;
};

export type CreditTransaction = {
  id: string;
  client_id: string;
  amount: number;
  description: string | null;
  transaction_type: string | null;
  created_at: string;
};

export type Delivery = {
  id: string;
  request_id: string;
  client_id: string;
  shoot_id: string | null;
  delivery_title: string | null;
  delivery_url: string;
  blob_path: string | null;
  file_type: "photo" | "video" | "zip" | "other" | string;
  status: "draft" | "published" | string;
  created_at: string;
  delivered_at: string | null;
};

export type AssetInsert = Omit<Asset, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: Client;
        Insert: Omit<Client, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Client>;
        Relationships: [];
      };
      shoots: {
        Row: Shoot;
        Insert: Omit<Shoot, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Shoot>;
        Relationships: [];
      };
      assets: {
        Row: Asset;
        Insert: AssetInsert;
        Update: Partial<Asset>;
        Relationships: [];
      };
      asset_requests: {
        Row: AssetRequest;
        Insert: Omit<AssetRequest, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<AssetRequest>;
        Relationships: [];
      };
      asset_request_items: {
        Row: AssetRequestItem;
        Insert: Omit<AssetRequestItem, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<AssetRequestItem>;
        Relationships: [];
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: Omit<CreditTransaction, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<CreditTransaction>;
        Relationships: [];
      };
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<User>;
        Relationships: [];
      };
      client_users: {
        Row: ClientUser;
        Insert: Omit<ClientUser, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<ClientUser>;
        Relationships: [];
      };
      deliveries: {
        Row: Delivery;
        Insert: Omit<Delivery, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Delivery>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
