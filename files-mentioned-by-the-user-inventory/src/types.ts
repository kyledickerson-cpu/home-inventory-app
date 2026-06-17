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

export type Household = {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
};

export type HouseholdMember = {
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  approved: boolean;
  created_at: string;
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
        Insert: {
          id?: string;
          household_id: string;
          item_name: string;
          category?: string | null;
          description?: string | null;
          quantity?: number;
          unit?: string | null;
          location?: string | null;
          supplier_name?: string | null;
          supplier_contact?: string | null;
          supplier_website?: string | null;
          purchase_date?: string | null;
          cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          household_id?: string;
          item_name?: string;
          category?: string | null;
          description?: string | null;
          quantity?: number;
          unit?: string | null;
          location?: string | null;
          supplier_name?: string | null;
          supplier_contact?: string | null;
          supplier_website?: string | null;
          purchase_date?: string | null;
          cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_items_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          }
        ];
      };
      household_members: {
        Row: HouseholdMember;
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
        Relationships: [
          {
            foreignKeyName: 'household_members_household_id_fkey';
            columns: ['household_id'];
            isOneToOne: false;
            referencedRelation: 'households';
            referencedColumns: ['id'];
          }
        ];
      };
      households: {
        Row: Household;
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];
export type InventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];
