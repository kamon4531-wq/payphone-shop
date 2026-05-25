export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  old_price: number | null;
  description: string | null;
  image_url: string;
  drive_file_id: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  phone: string;
  price: number;
  created_at: string;
};

export const CATEGORIES = [
  { id: "all", name: "ทั้งหมด" },
  { id: "battery", name: "แบตเตอรี่/พาวเวอร์แบงค์" },
  { id: "cable", name: "สายชาร์จ" },
  { id: "case", name: "เคสโทรศัพท์" },
  { id: "charger", name: "หัวชาร์จ" },
  { id: "earphone", name: "หูฟัง" },
  { id: "film", name: "ฟิล์มกระจก" },
  { id: "gadget", name: "อุปกรณ์เสริม" },
  { id: "speaker", name: "ลำโพง" },
  { id: "holder", name: "ที่จับ/ขาตั้ง" },
  { id: "personal", name: "เครื่องประดับ" }
];
