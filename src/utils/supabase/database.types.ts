export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type HotPepperShop = {
  id?: string;
  user_id: string;
  hotpepper_id: string;
  name: string;
  image_url: string;
  shop_url: string;
  address: string;
  genre: string;
  group_id: string;
  latitude: number | null;
  longitude: number | null;
  budget: string | null;
};

export type SharedShop = {
  id?: string;
  user_id: string;
  hotpepper_id: string;
  name: string;
  image_url: string;
  shop_url: string;
  address: string;
  genre: string;
  group_id: string;
  latitude: number | null;
  longitude: number | null;
  budget: string | null;
};

export type Group = {
  id?: string;
  name: string;
  created_by: string;
};

export type Database = {
  public: {
    Tables: {
      shared_shops: {
        Row: SharedShop;
        Insert: Omit<SharedShop, "id">; // idは自動生成の場合
        Update: Partial<SharedShop>;
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, "id">;
        Update: Partial<Group>;
      };
    };
  };
};
