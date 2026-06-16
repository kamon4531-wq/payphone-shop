"use client";
import { useEffect, useState } from "react";

export type Lang = "th" | "en";

export const dict = {
  th: {
    welcome: "ยินดีต้อนรับสู่ PAY BY PA.PHONE แหล่งรวมอุปกรณ์มือถือที่ดีที่สุด",
    search: "ค้นหา เคส, สายชาร์จ, พาวเวอร์แบงค์ หรือหัวชาร์จเร็ว...",
    login: "เข้าสู่ระบบ",
    categories: "หมวดหมู่ยอดนิยม",
    recommended: "สินค้าแนะนำสำหรับคุณ",
    noProducts: "ยังไม่มีสินค้าในหมวดนี้",
    viewDetails: "ดูรายละเอียด / สั่งซื้อ",
    productDetails: "รายละเอียดสินค้า",
    buyerInfo: "ข้อมูลผู้สั่งซื้อ",
    payment: "ชำระเงิน",
    orderSuccess: "สั่งซื้อสำเร็จ",
    fullName: "ชื่อ-นามสกุล",
    phone: "เบอร์โทรศัพท์",
    branch: "สาขาที่สั่งซื้อ",
    province: "จังหวัด",
    address: "ที่อยู่จัดส่ง",
    selectProvince: "-- เลือกจังหวัด --",
    searchBranch: "พิมพ์ค้นหา เช่น ปราจีน, ขอนแก่น...",
    addressPlaceholder: "บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ รหัสไปรษณีย์",
    back: "← ย้อนกลับ",
    proceedPayment: "ดำเนินการชำระเงิน →",
    amountToTransfer: "ยอดที่ต้องโอน",
    scanQR: "สแกน QR เพื่อชำระเงิน",
    transferTime: "เวลาที่โอน",
    uploadSlip: "อัพโหลดสลิป",
    confirmOrder: "ยืนยันสั่งซื้อ",
    sending: "กำลังส่ง...",
    thankYou: "ขอบคุณสำหรับการสั่งซื้อ!",
    willContact: "ทางร้านจะตรวจสอบสลิปและติดต่อกลับ",
    close: "ปิด",
    orderProduct: "สั่งซื้อสินค้านี้",
    description: "รายละเอียดสินค้า"
  },
  en: {
    welcome: "Welcome to PAY BY PA.PHONE - Best mobile accessories shop",
    search: "Search cases, cables, powerbanks, chargers...",
    login: "Login",
    categories: "Popular Categories",
    recommended: "Recommended for You",
    noProducts: "No products in this category",
    viewDetails: "View Details / Order",
    productDetails: "Product Details",
    buyerInfo: "Buyer Information",
    payment: "Payment",
    orderSuccess: "Order Successful",
    fullName: "Full Name",
    phone: "Phone Number",
    branch: "Branch",
    province: "Province",
    address: "Shipping Address",
    selectProvince: "-- Select Province --",
    searchBranch: "Type to search e.g. Prachin, Khonkaen...",
    addressPlaceholder: "House no., soi, road, sub-district, district, postal code",
    back: "← Back",
    proceedPayment: "Proceed to Payment →",
    amountToTransfer: "Amount to Transfer",
    scanQR: "Scan QR to Pay",
    transferTime: "Transfer Time",
    uploadSlip: "Upload Slip",
    confirmOrder: "Confirm Order",
    sending: "Sending...",
    thankYou: "Thank you for your order!",
    willContact: "We will verify your slip and contact you back",
    close: "Close",
    orderProduct: "Order This Product",
    description: "Product Description"
  }
};

export const CAT_NAMES: Record<Lang, Record<string, string>> = {
  th: {
    all: "ทั้งหมด",
    battery: "แบตเตอรี่/พาวเวอร์แบงค์",
    cable: "สายชาร์จ",
    case: "เคสโทรศัพท์",
    charger: "หัวชาร์จ",
    earphone: "หูฟัง",
    film: "ฟิล์มกระจก",
    gadget: "อุปกรณ์เสริม",
    speaker: "ลำโพง",
    holder: "ที่จับ/ขาตั้ง",
    personal: "เครื่องประดับ"
  },
  en: {
    all: "All",
    battery: "Battery / Powerbank",
    cable: "Cable",
    case: "Phone Case",
    charger: "Charger",
    earphone: "Earphone",
    film: "Screen Protector",
    gadget: "Accessory",
    speaker: "Speaker",
    holder: "Holder / Stand",
    personal: "Personal Accessory"
  }
};

export const BANNER_SLIDES: Record<Lang, Array<{title:string; subtitle:string; badge:string}>> = {
  th: [
    { title: "SUPER CHARGING WEEK", subtitle: "หัวชาร์จเร็ว GaN + สายชาร์จเกรดทหาร", badge: "เริ่มต้น ฿150" },
    { title: "MAGSAFE COLLECTION", subtitle: "เคส MagSafe Premium iPhone 15/16 Pro Max", badge: "ลด 51%" },
    { title: "POWER UP ANYWHERE", subtitle: "พาวเวอร์แบงค์ไร้สาย Magnetic 10000mAh", badge: "พกพาสะดวก" }
  ],
  en: [
    { title: "SUPER CHARGING WEEK", subtitle: "GaN Chargers + Military-grade Cables", badge: "From ฿150" },
    { title: "MAGSAFE COLLECTION", subtitle: "Premium MagSafe Case for iPhone 15/16 Pro Max", badge: "51% OFF" },
    { title: "POWER UP ANYWHERE", subtitle: "Magnetic Wireless Powerbank 10000mAh", badge: "Portable" }
  ]
};

export const PROVINCE_EN: Record<string, string> = {
  "กรุงเทพมหานคร":"Bangkok","กระบี่":"Krabi","กาญจนบุรี":"Kanchanaburi","กาฬสินธุ์":"Kalasin","กำแพงเพชร":"Kamphaeng Phet",
  "ขอนแก่น":"Khon Kaen","จันทบุรี":"Chanthaburi","ฉะเชิงเทรา":"Chachoengsao","ชลบุรี":"Chonburi","ชัยนาท":"Chai Nat","ชัยภูมิ":"Chaiyaphum",
  "ชุมพร":"Chumphon","เชียงราย":"Chiang Rai","เชียงใหม่":"Chiang Mai","ตรัง":"Trang","ตราด":"Trat","ตาก":"Tak",
  "นครนายก":"Nakhon Nayok","นครปฐม":"Nakhon Pathom","นครพนม":"Nakhon Phanom","นครราชสีมา":"Nakhon Ratchasima","นครศรีธรรมราช":"Nakhon Si Thammarat","นครสวรรค์":"Nakhon Sawan",
  "นนทบุรี":"Nonthaburi","นราธิวาส":"Narathiwat","น่าน":"Nan","บึงกาฬ":"Bueng Kan","บุรีรัมย์":"Buriram",
  "ปทุมธานี":"Pathum Thani","ประจวบคีรีขันธ์":"Prachuap Khiri Khan","ปราจีนบุรี":"Prachinburi","ปัตตานี":"Pattani","พระนครศรีอยุธยา":"Phra Nakhon Si Ayutthaya",
  "พะเยา":"Phayao","พังงา":"Phangnga","พัทลุง":"Phatthalung","พิจิตร":"Phichit","พิษณุโลก":"Phitsanulok","เพชรบุรี":"Phetchaburi","เพชรบูรณ์":"Phetchabun",
  "แพร่":"Phrae","ภูเก็ต":"Phuket","มหาสารคาม":"Maha Sarakham","มุกดาหาร":"Mukdahan","แม่ฮ่องสอน":"Mae Hong Son",
  "ยโสธร":"Yasothon","ยะลา":"Yala","ร้อยเอ็ด":"Roi Et","ระนอง":"Ranong","ระยอง":"Rayong","ราชบุรี":"Ratchaburi",
  "ลพบุรี":"Lopburi","ลำปาง":"Lampang","ลำพูน":"Lamphun","เลย":"Loei","ศรีสะเกษ":"Sisaket","สกลนคร":"Sakon Nakhon",
  "สงขลา":"Songkhla","สตูล":"Satun","สมุทรปราการ":"Samut Prakan","สมุทรสงคราม":"Samut Songkhram","สมุทรสาคร":"Samut Sakhon","สระแก้ว":"Sa Kaeo","สระบุรี":"Saraburi",
  "สิงห์บุรี":"Sing Buri","สุโขทัย":"Sukhothai","สุพรรณบุรี":"Suphan Buri","สุราษฎร์ธานี":"Surat Thani","สุรินทร์":"Surin","หนองคาย":"Nong Khai","หนองบัวลำภู":"Nong Bua Lamphu",
  "อ่างทอง":"Ang Thong","อำนาจเจริญ":"Amnat Charoen","อุดรธานี":"Udon Thani","อุตรดิตถ์":"Uttaradit","อุทัยธานี":"Uthai Thani","อุบลราชธานี":"Ubon Ratchathani"
};

export function useLang() {
  const [lang, setLang] = useState<Lang>("th");
  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("lang") : null) as Lang | null;
    if (saved === "th" || saved === "en") setLang(saved);
  }, []);
  function change(l: Lang) {
    setLang(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  }
  function t(key: keyof typeof dict.th): string {
    return dict[lang][key] || dict.th[key];
  }
  function catName(id: string): string {
    return CAT_NAMES[lang][id] || id;
  }
  function provName(th: string): string {
    return lang === "en" ? (PROVINCE_EN[th] || th) : th;
  }
  return { lang, change, t, catName, provName };
}
