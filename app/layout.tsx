import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "PAY BY PA.PHONE",
  description: "แหล่งรวมอุปกรณ์มือถือที่ดีที่สุด",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PAY BY PA.PHONE"
  }
};

export const viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="icon" href="/logo.png"/>
        <link rel="apple-touch-icon" href="/logo.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="PAY BY PA.PHONE"/>
        <meta name="theme-color" content="#10b981"/>
      </head>
      <body>
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }

          let deferredPrompt;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const btn = document.createElement('button');
            btn.innerHTML = '📱 ติดตั้งแอป';
            btn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:50px;font-weight:bold;border:none;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9999;font-size:14px;cursor:pointer;animation:pulse 2s infinite';
            btn.id = 'install-btn';
            
            const style = document.createElement('style');
            style.textContent = '@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}';
            document.head.appendChild(style);
            
            btn.addEventListener('click', async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') btn.remove();
                deferredPrompt = null;
              }
            });
            
            document.body.appendChild(btn);
          });

          window.addEventListener('appinstalled', () => {
            const btn = document.getElementById('install-btn');
            if (btn) btn.remove();
          });
        `}</Script>
      </body>
    </html>
  );
}
