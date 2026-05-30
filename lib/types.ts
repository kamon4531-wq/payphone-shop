export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  old_price: number | null;
  description: string | null;
  image_url: string;
  image_url2: string | null;
  image_url3: string | null;
  badge_text: string | null;
  drive_file_id: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  phone: string;
  address: string | null;
  province: string | null;
  price: number;
  slip_url: string | null;
  slip_id: string | null;
  transfer_time: string | null;
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

export const THAI_PROVINCES = [
  "กรุงเทพมหานคร","กระบี่","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร",
  "ขอนแก่น","จันทบุรี","ฉะเชิงเทรา","ชลบุรี","ชัยนาท","ชัยภูมิ",
  "ชุมพร","เชียงราย","เชียงใหม่","ตรัง","ตราด","ตาก",
  "นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์",
  "นนทบุรี","นราธิวาส","น่าน","บึงกาฬ","บุรีรัมย์",
  "ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา",
  "พะเยา","พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์",
  "แพร่","ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน",
  "ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี",
  "ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร",
  "สงขลา","สตูล","สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี",
  "สิงห์บุรี","สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู",
  "อ่างทอง","อำนาจเจริญ","อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี"
];
