export type InventoryItem = {
  id: string;
  household_id: string;
  item_name: string;
  category: string | null;
  description: string | null;
  quantity: number;
  unit: string | null;
  location: string | null;
  supplier_name: string | null;
  supplier_contact: string | null;
  supplier_website: string | null;
  purchase_date: string | null;
  cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type HouseholdMembership = {
  household_id: string;
  role: 'owner' | 'member';
  approved: boolean;
  households: {
    id: string;
    name: string;
  } | null;
};

export type InventoryFormValues = Omit<
  InventoryItem,
  'id' | 'household_id' | 'created_at' | 'updated_at' | 'created_by'
>;

export type Database = {
  public: {
    Tables: {
      inventory_items: {
        Row: InventoryItem;
        Insert: Partial<InventoryItem> & {
          household_id: string;
          item_name: string;
        };
        Update: Partial<InventoryItem>;
      };
      household_members: {
        Row: {
          household_id: string;
          user_id: string;
          role: 'owner' | 'member';
          approved: boolean;
          created_at: string;
        };
        Insert: {
          household_id: string;
          user_id: string;
          role?: 'owner' | 'member';
          approved?: boolean;
        };
        Update: {
          role?: 'owner' | 'member';
          approved?: boolean;
        };
      };
      households: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
        };
        Update: {
          name?: string;
        };
      };
    };
  };
};
