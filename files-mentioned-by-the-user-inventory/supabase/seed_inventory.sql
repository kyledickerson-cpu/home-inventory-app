-- Run after supabase/schema.sql.
-- Replace the two example emails after both users have created Supabase Auth accounts.

insert into public.households (id, name)
values ('11111111-1111-4111-8111-111111111111', 'Home Inventory')
on conflict (id) do update set name = excluded.name;

-- Approve users by email after signup.
insert into public.household_members (household_id, user_id, role, approved)
select
  '11111111-1111-4111-8111-111111111111',
  id,
  case when email = 'kyledickersonza@icloud.com' then 'owner' else 'member' end,
  true
from auth.users
where email in ('kyledickersonza@icloud.com', 'delvin.hayes@icloud.com')
on conflict (household_id, user_id) do update
set role = excluded.role,
    approved = excluded.approved;

with seed (
  household_id,
  item_name,
  category,
  description,
  quantity,
  unit,
  location,
  supplier_name,
  supplier_contact,
  supplier_website,
  purchase_date,
  cost,
  notes
) as (
values
('11111111-1111-4111-8111-111111111111','BEVMAX 3 EVAPORATOR BRACKET (BLACK)','Vending parts','Part no. FV-1001',1,'each','','3D print','','',null,6.50,'Supplier price: 23.90; Supplier: Crane'),
('11111111-1111-4111-8111-111111111111','BEVMAX 3 CONDENSOR DRIP TIP (BLACK)','Vending parts','Part no. FV-1002',1,'each','','3D print','','',null,null,''),
('11111111-1111-4111-8111-111111111111','BEVMAX 3 EVAPORATOR DRIP TRAY (BLACK)','Vending parts','Part no. FV-1003',1,'each','','3D print','','',null,null,''),
('11111111-1111-4111-8111-111111111111','X MOTOR COVER WHITE','Vending parts','Part no. FV-1004',1,'each','','3D print','','',null,9.50,'Supplier price: 14.17; Supplier part no: D80182329; Supplier: Crane'),
('11111111-1111-4111-8111-111111111111','X MOTOR COVER WHITE','Vending parts','Part no. FV-1005',1,'each','','3D print','','',null,9.50,'Supplier price: 13.24; Supplier part no: D80182328; Supplier: Crane'),
('11111111-1111-4111-8111-111111111111','EVOCA MOTOR CASING (BLACK)','Vending parts','Part no. FV-1006',1,'each','','3D print','','',null,10.00,''),
('11111111-1111-4111-8111-111111111111','Y PULLEY / MOTOR BRACKET (WHITE)','Vending parts','Part no. FV-1007',1,'each','','3D print','','',null,40.00,'Supplier price: 82.76; Supplier part no: CR0005937; Supplier: Crane'),
('11111111-1111-4111-8111-111111111111','X PULLEY / MOTOR BRACKET (WHITE)','Vending parts','Part no. FV-1008',1,'each','','3D print','','',null,40.00,'Supplier price: 83.15; Supplier part no: CR0006104; Supplier: Crane'),
('11111111-1111-4111-8111-111111111111','KNIGHTS BRIDGE LIGHT','Electrical','Part no. FV-1009',1,'each','','Electrical go','','',null,12.50,'Supplier price: 13.90; Supplier: Yess'),
('11111111-1111-4111-8111-111111111111','KNIGHTS BRIDGE LINK CABLE','Electrical','Part no. FV-1010',1,'each','','Electrical go','','',null,4.00,'Supplier price: 5.20; Supplier: Yess'),
('11111111-1111-4111-8111-111111111111','COMPACT AXIAL FAN 120X120X28','Electrical','Part no. FV-1011',1,'each','','Aliexpress','','',null,13.20,'Supplier price: 14.12; Supplier part no: PS1238BT-1; Supplier: Polestar'),
('11111111-1111-4111-8111-111111111111','UNIVERSAL FIT 10W MOTOR','Electrical','Part no. FV-1012',1,'each','','Alibaba','','',null,13.20,'Supplier price: 14.20; Supplier part no: PS10BM-1; Supplier: Polestar'),
('11111111-1111-4111-8111-111111111111','TRAY STABILIZER','Vending parts','Part no. FV-1013',1,'each','','3D print','','',null,1.25,'Supplier price: 2.38; Supplier part no: D80190501; Supplier: Crane'),
('11111111-1111-4111-8111-111111111111','GREY KEYPAD BEVMAX','Vending parts','Part no. FV-1014',1,'each','','3D print','','',null,8.50,'Supplier price: 12.89; Supplier part no: D80182462021; Supplier: Crane'),
('11111111-1111-4111-8111-111111111111','BEVMAX PORT WASHER','Vending parts','Part no. FV-1015',1,'each','','3D print','','',null,0.10,'Supplier price: 0.80'),
('11111111-1111-4111-8111-111111111111','BEVMAX X RAIL WASHER','Vending parts','Part no. FV-1016',1,'each','','3D print','','',null,0.10,'Supplier price: 0.80'),
('11111111-1111-4111-8111-111111111111','DISCHARGE PAD','Vending parts','Part no. FV-1017',1,'each','','Foam roll','','',null,3.50,'Supplier price: 8.75; Supplier: Crane'),
('11111111-1111-4111-8111-111111111111','EVOCA RELAY','Electrical','Part no. FV-1018',1,'each','','Amazon','','',null,15.00,'Supplier price: 80.00; Supplier: Evoca'),
('11111111-1111-4111-8111-111111111111','HF102F - RELAY','Electrical','Part no. FV-1019',1,'each','','','','',null,15.75,''),
('11111111-1111-4111-8111-111111111111','HF33F - RELAY','Electrical','Part no. FV-1020',1,'each','','','','',null,15.25,''),
('11111111-1111-4111-8111-111111111111','2.54MM JST 4 PIN CONNECTOR','Electrical','Part no. FV-1021',1,'each','','','','',null,3.50,''),
('11111111-1111-4111-8111-111111111111','2.54MM JST TERMINAL','Electrical','Part no. FV-1022',1,'each','','','','',null,4.00,''),
('11111111-1111-4111-8111-111111111111','CARD READER BLANK','Vending parts','Part no. FV-1023',1,'each','','','','',null,7.00,''),
('11111111-1111-4111-8111-111111111111','SOLDER IRON CLEANER','Tools and consumables','Part no. FV-1024',1,'each','','','','',null,8.50,''),
('11111111-1111-4111-8111-111111111111','SOLDER PASTE','Tools and consumables','Part no. FV-1025',1,'each','','','','',null,5.25,''),
('11111111-1111-4111-8111-111111111111','FLUX PASTE','Tools and consumables','Part no. FV-1026',1,'each','','','','',null,5.25,''),
('11111111-1111-4111-8111-111111111111','DESOLDER BRAID ROLL','Tools and consumables','Part no. FV-1027',1,'each','','','','',null,5.30,''),
('11111111-1111-4111-8111-111111111111','22AWG WIRE BOX OF 5','Electrical','Part no. FV-1028',1,'box','','','','',null,15.95,''),
('11111111-1111-4111-8111-111111111111','HEAT TAPE FOR PCB PACK','Tools and consumables','Part no. FV-1029',1,'pack','','','','',null,9.75,''),
('11111111-1111-4111-8111-111111111111','ANTI STATIC BRUSH FOR PCB','Tools and consumables','Part no. FV-1030',1,'each','','','','',null,1.76,'')
)
insert into public.inventory_items (
  household_id,
  item_name,
  category,
  description,
  quantity,
  unit,
  location,
  supplier_name,
  supplier_contact,
  supplier_website,
  purchase_date,
  cost,
  notes
)
select
  household_id,
  item_name,
  category,
  description,
  quantity,
  unit,
  location,
  supplier_name,
  supplier_contact,
  supplier_website,
  purchase_date,
  cost,
  notes
from seed
where not exists (
  select 1
  from public.inventory_items existing
  where existing.household_id = seed.household_id
    and existing.description = seed.description
);
