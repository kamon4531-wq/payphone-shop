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
  branch: string | null;
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

export const BRANCHES = [
  { region: "R1", name: "B02:PA เซ็นทรัล ขอนแก่น" },
  { region: "R1", name: "B07:PA สุรินทร์พลาซ่า สุรินทร์" },
  { region: "R1", name: "B08:PA โรบินสัน สกลนคร" },
  { region: "R1", name: "B17:PA The Mall โคราช" },
  { region: "R1", name: "B18:PA เซ็นทรัล อุดรธานี 2" },
  { region: "R1", name: "B22:PA เซ็นทรัล อุบลราชธานี" },
  { region: "R1", name: "B28:PA ทวีกิจ บุรีรัมย์" },
  { region: "R1", name: "B31:PA โรบินสัน สุรินทร์" },
  { region: "R1", name: "B33:PA โรบินสัน ร้อยเอ็ด" },
  { region: "R1", name: "B38:PA โรบินสัน มุกดาหาร" },
  { region: "R1", name: "B43:PA เสริมไทย มหาสารคาม" },
  { region: "R1", name: "B58:PA เซ็นทรัล นครราชสีมา" },
  { region: "R1", name: "B66:PA โรบินสัน ชัยภูมิ" },
  { region: "R1", name: "B74:PA บิ๊กซี กาฬสินธุ์" },
  { region: "R2", name: "B06:PA บิ๊กซี นครสวรรค์" },
  { region: "R2", name: "B16:PA โรบินสัน สุพรรณบุรี" },
  { region: "R2", name: "B21:PA เซ็นทรัล ลำปาง" },
  { region: "R2", name: "B23:PA โรบินสัน กาญจนบุรี" },
  { region: "R2", name: "B26:PA โรบินสัน สระบุรี" },
  { region: "R2", name: "B27:PA เซ็นทรัลเฟสติวัล เชียงใหม่" },
  { region: "R2", name: "B45:PA ทวีกิจ สระบุรี" },
  { region: "R2", name: "B46:PA โรบินสัน แม่สอด" },
  { region: "R2", name: "B53:PA โรบินสัน ลพบุรี" },
  { region: "R2", name: "B59:PA โรบินสัน กำแพงเพชร" },
  { region: "R2", name: "B68:PA บิ๊กซี ลำพูน" },
  { region: "R2", name: "B83:PA เซ็นทรัล อยุธยา" },
  { region: "R2", name: "B87:PA เซ็นทรัล นครสวรรค์" },
  { region: "R2", name: "B88:PA Big C สระบุรี" },
  { region: "R3", name: "B10:PA ตึกคอม พัทยาใต้" },
  { region: "R3", name: "B11:PA เซ็นทรัล ชลบุรี" },
  { region: "R3", name: "B12:PA โรบินสัน ศรีราชา" },
  { region: "R3", name: "B13:PA เซ็นทรัล พัทยาบีช" },
  { region: "R3", name: "B34:PA โรบินสัน ฉะเชิงเทรา" },
  { region: "R3", name: "B35:PA แพชชั่น ระยอง 2" },
  { region: "R3", name: "B36:PA โรบินสัน สมุทรปราการ" },
  { region: "R3", name: "B37:PA โรบินสัน ปราจีนบุรี" },
  { region: "R3", name: "B40:PA เซ็นทรัล ระยอง" },
  { region: "R3", name: "B55:PA โรบินสัน จันทบุรี" },
  { region: "R3", name: "B64:PA โรบินสัน ชลบุรี" },
  { region: "R3", name: "B72:PA โรบินสัน สุวรรณภูมิ" },
  { region: "R3", name: "B81:PA โรบินสัน บ้านฉาง" },
  { region: "R3", name: "B82:PA เซ็นทรัล ศรีราชา" },
  { region: "R3", name: "B84:PA เซ็นทรัล จันทบุรี" },
  { region: "R4", name: "B15:PA เซ็นทรัล ภูเก็ต" },
  { region: "R4", name: "B20:PA เซ็นทรัล สุราษฎร์ธานี" },
  { region: "R4", name: "B30:PA เซ็นทรัลเฟสติวัล หาดใหญ่" },
  { region: "R4", name: "B32:PA เซ็นทรัล สมุย" },
  { region: "R4", name: "B44:PA โรบินสัน ศรีสมาน" },
  { region: "R4", name: "B49:PA เซ็นทรัล นครศรีธรรมราช" },
  { region: "R4", name: "B50:PA โรบินสัน ราชบุรี" },
  { region: "R4", name: "B51:PA Bluport Mall หัวหิน" },
  { region: "R4", name: "B56:PA โรบินสัน เพชรบุรี" },
  { region: "R4", name: "B61:PA สหไทย ทุ่งสง" },
  { region: "R4", name: "B80:PA มาร์เก็ตวิลเล็จ คลอง4" },
  { region: "R4", name: "B85:PA โรบินสัน ถลาง" },
  { region: "R4", name: "B86:PA โรบินสัน ฉลอง" }
];
