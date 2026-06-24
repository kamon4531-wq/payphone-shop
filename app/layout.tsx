import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "PAY BY PA.PHONE",
  description: "แหล่งรวมอุปกรณ์มือถือที่ดีที่สุด",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "PAY BY PA.PHONE" }
};

export const viewport = { themeColor: "#10b981", width: "device-width", initialScale: 1, maximumScale: 1 };

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
            window.addEventListener('load', async () => {
              try {
                const reg = await navigator.serviceWorker.register('/public/sw.js');
                
                try {
                  const meRes = await fetch('/api/admin/me');
                  if (meRes.ok && 'PushManager' in window) {
                    const perm = await Notification.requestPermission();
                    if (perm === 'granted') {
                      const existing = await reg.pushManager.getSubscription();
                      if (!existing) {
                        const vapid = '${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''}';
                        if (vapid) {
                          const sub = await reg.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(vapid)
                          });
                          await fetch('/api/push/subscribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(sub)
                          });
                        }
                      }
                    }
                  }
                } catch (e) { console.warn('Push setup:', e); }
              } catch (e) { console.warn('SW reg:', e); }
            });
          }

          function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
            const rawData = atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
            return outputArray;
          }

          let deferredPrompt;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const btn = document.createElement('button');
            btn.innerHTML = '📱 ติดตั้งแอป';
            btn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:50px;font-weight:bold;border:none;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9999;font-size:14px;cursor:pointer';
            btn.id = 'install-btn';
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
