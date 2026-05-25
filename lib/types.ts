export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  old_price: number | null;
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
  { id: "case", name: "เคสโทรศัพท์/อุปกรณ์เสริม" },
  { id: "charger", name: "หัวชาร์จเร็ว" },
  { id: "film", name: "ฟิล์มกระจกนิรภัย" },
  { id: "powerbank", name: "พาวเวอร์แบงค์" },
  { id: "cable", name: "สายชาร์จ" },
  { id: "audio", name: "หูฟัง/เสียง" }
];
