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
  return { lang, change, t };
}
