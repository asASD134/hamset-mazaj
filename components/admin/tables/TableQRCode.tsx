"use client";

import QRCode from "react-qr-code";

interface TableQRCodeProps {
  tableNumber: number;
}

export default function TableQRCode({
  tableNumber,
}: TableQRCodeProps) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/?table=${tableNumber}`
      : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      alert("تم نسخ رابط الطاولة.");
    } catch {
      alert("تعذر نسخ الرابط.");
    }
  }

  function printQRCode() {
    const printWindow = window.open(
      "",
      "_blank",
      "width=420,height=600"
    );

    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>QR طاولة ${tableNumber}</title>

        <style>
          body{
            margin:0;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            background:#fff;
            font-family:Arial,sans-serif;
          }

          .card{
            border:2px solid #000;
            border-radius:16px;
            padding:24px;
            text-align:center;
          }

          h2{
            margin:0 0 20px;
          }

          img{
            width:220px;
            height:220px;
          }

          p{
            margin-top:20px;
            font-size:14px;
            word-break:break-word;
          }
        </style>
      </head>

      <body>

        <div class="card">
          <h2>طاولة ${tableNumber}</h2>

          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
              url
            )}"
          />

          <p>${url}</p>
        </div>

        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>

      </body>
      </html>
    `);

    printWindow.document.close();
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-yellow-500/20 bg-zinc-900 p-6">
      <QRCode
        value={url}
        size={180}
        bgColor="#ffffff"
        fgColor="#000000"
      />

      <div className="text-center">
        <h3 className="text-xl font-bold text-yellow-400">
          طاولة {tableNumber}
        </h3>

        <p className="mt-2 break-all text-xs text-zinc-400">
          {url}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={copyLink}
          className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
        >
          نسخ الرابط
        </button>

        <button
          onClick={printQRCode}
          className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400"
        >
          طباعة QR
        </button>
      </div>
    </div>
  );
}