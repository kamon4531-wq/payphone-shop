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
  order_number: string | null;
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

export const BRANCHES: { region: string; name: string; line_oa_id: string | null }[] = [
  { region: "R1", name: "B02:PA เซ็นทรัล ขอนแก่น", line_oa_id: "@699btabg" },
  { region: "R1", name: "B07:PA สุรินทร์พลาซ่า สุรินทร์", line_oa_id: "@969tzomz" },
  { region: "R1", name: "B08:PA โรบินสัน สกลนคร", line_oa_id: "@645pwipp" },
  { region: "R1", name: "B17:PA The Mall โคราช", line_oa_id: "@788dzruk" },
  { region: "R1", name: "B18:PA เซ็นทรัล อุดรธานี 2", line_oa_id: "@292xhxyt" },
  { region: "R1", name: "B22:PA เซ็นทรัล อุบลราชธานี", line_oa_id: "@483knzll" },
  { region: "R1", name: "B28:PA ทวีกิจ บุรีรัมย์", line_oa_id: "@636fbihd" },
  { region: "R1", name: "B31:PA โรบินสัน สุรินทร์", line_oa_id: "@312otaws" },
  { region: "R1", name: "B33:PA โรบินสัน ร้อยเอ็ด", line_oa_id: "@594pcrvi" },
  { region: "R1", name: "B38:PA โรบินสัน มุกดาหาร", line_oa_id: "@231yjfwv" },
  { region: "R1", name: "B43:PA เสริมไทย มหาสารคาม", line_oa_id: "@144zdmlp" },
  { region: "R1", name: "B58:PA เซ็นทรัล นครราชสีมา", line_oa_id: "@383eheeb" },
  { region: "R1", name: "B66:PA โรบินสัน ชัยภูมิ", line_oa_id: "@308rdaas" },
  { region: "R1", name: "B74:PA บิ๊กซี กาฬสินธุ์", line_oa_id: "@935muxej" },
  { region: "R2", name: "B06:PA บิ๊กซี นครสวรรค์", line_oa_id: "@874izdfc" },
  { region: "R2", name: "B16:PA โรบินสัน สุพรรณบุรี", line_oa_id: "@274tbfhb" },
  { region: "R2", name: "B21:PA เซ็นทรัล ลำปาง", line_oa_id: "@023qcswg" },
  { region: "R2", name: "B23:PA โรบินสัน กาญจนบุรี", line_oa_id: "@623jqnlr" },
  { region: "R2", name: "B26:PA โรบินสัน สระบุรี", line_oa_id: "@663ddcbb" },
  { region: "R2", name: "B27:PA เซ็นทรัลเฟสติวัล เชียงใหม่", line_oa_id: "@036nlaxn" },
  { region: "R2", name: "B45:PA ทวีกิจ สระบุรี", line_oa_id: "@552fzmvv" },
  { region: "R2", name: "B46:PA โรบินสัน แม่สอด", line_oa_id: "@245ywphi" },
  { region: "R2", name: "B53:PA โรบินสัน ลพบุรี", line_oa_id: "@415nbwul" },
  { region: "R2", name: "B59:PA โรบินสัน กำแพงเพชร", line_oa_id: "@691nzmcv" },
  { region: "R2", name: "B68:PA บิ๊กซี ลำพูน", line_oa_id: "@651aujcp" },
  { region: "R2", name: "B83:PA เซ็นทรัล อยุธยา", line_oa_id: "@205mdgg" },
  { region: "R2", name: "B87:PA เซ็นทรัล นครสวรรค์", line_oa_id: "@603gtlrh" },
  { region: "R2", name: "B88:PA Big C สระบุรี", line_oa_id: "@730stugm" },
  { region: "R3", name: "B10:PA ตึกคอม พัทยาใต้", line_oa_id: "@781lkbxm" },
  { region: "R3", name: "B11:PA เซ็นทรัล ชลบุรี", line_oa_id: "@005mjwcf" },
  { region: "R3", name: "B12:PA โรบินสัน ศรีราชา", line_oa_id: "@145zrrlx" },
  { region: "R3", name: "B13:PA เซ็นทรัล พัทยาบีช", line_oa_id: "@494qgjuo" },
  { region: "R3", name: "B34:PA โรบินสัน ฉะเชิงเทรา", line_oa_id: "@902ztdxe" },
  { region: "R3", name: "B35:PA แพชชั่น ระยอง 2", line_oa_id: "@632fvalb" },
  { region: "R3", name: "B36:PA โรบินสัน สมุทรปราการ", line_oa_id: "@305lhidt" },
  { region: "R3", name: "B37:PA โรบินสัน ปราจีนบุรี", line_oa_id: "@119cvgkb" },
  { region: "R3", name: "B40:PA เซ็นทรัล ระยอง", line_oa_id: "@768bziev" },
  { region: "R3", name: "B55:PA โรบินสัน จันทบุรี", line_oa_id: "@550rlybo" },
  { region: "R3", name: "B64:PA โรบินสัน ชลบุรี", line_oa_id: "@631cbwkt" },
  { region: "R3", name: "B72:PA โรบินสัน สุวรรณภูมิ", line_oa_id: "@011apkhj" },
  { region: "R3", name: "B81:PA โรบินสัน บ้านฉาง", line_oa_id: "@336ougvq" },
  { region: "R3", name: "B82:PA เซ็นทรัล ศรีราชา", line_oa_id: "@177hdswp" },
  { region: "R3", name: "B84:PA เซ็นทรัล จันทบุรี", line_oa_id: "@508hmmxr" },
  { region: "R4", name: "B15:PA เซ็นทรัล ภูเก็ต", line_oa_id: "@999pmqdx" },
  { region: "R4", name: "B20:PA เซ็นทรัล สุราษฎร์ธานี", line_oa_id: "@056wszlv" },
  { region: "R4", name: "B30:PA เซ็นทรัลเฟสติวัล หาดใหญ่", line_oa_id: "@845qfqir" },
  { region: "R4", name: "B32:PA เซ็นทรัล สมุย", line_oa_id: "@417utbaj" },
  { region: "R4", name: "B44:PA โรบินสัน ศรีสมาน", line_oa_id: "@629kojef" },
  { region: "R4", name: "B49:PA เซ็นทรัล นครศรีธรรมราช", line_oa_id: "@367dnwwj" },
  { region: "R4", name: "B50:PA โรบินสัน ราชบุรี", line_oa_id: "@783stwju" },
  { region: "R4", name: "B51:PA Bluport Mall หัวหิน", line_oa_id: "@534boutn" },
  { region: "R4", name: "B56:PA โรบินสัน เพชรบุรี", line_oa_id: "@871fgddd" },
  { region: "R4", name: "B61:PA สหไทย ทุ่งสง", line_oa_id: "@109nwnpp" },
  { region: "R4", name: "B80:PA มาร์เก็ตวิลเล็จ คลอง4", line_oa_id: "@584wysle" },
  { region: "R4", name: "B85:PA โรบินสัน ถลาง", line_oa_id: "@664glrsi" },
  { region: "R4", name: "B86:PA โรบินสัน ฉลอง", line_oa_id: "@192uthqo" }
];
