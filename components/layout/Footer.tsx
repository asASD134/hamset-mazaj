export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-yellow-500 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        {/* معلومات المقهى */}
        <div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            ☕ همسة مزاج
          </h2>

          <p className="text-gray-300">
            استمتع بأفضل أنواع القهوة والجلسات الهادئة
            ومتابعة أهم المباريات على الشاشات الكبيرة.
          </p>
        </div>

        {/* روابط سريعة */}
        <div>
          <h3 className="text-xl font-semibold text-yellow-400 mb-4">
            روابط سريعة
          </h3>

          <ul className="space-y-2">
            <li><a href="/" className="hover:text-yellow-400">الرئيسية</a></li>
            <li><a href="/menu" className="hover:text-yellow-400">المنيو</a></li>
            <li><a href="/gallery" className="hover:text-yellow-400">المعرض</a></li>
            <li><a href="/matches" className="hover:text-yellow-400">المباريات</a></li>
            <li><a href="/contact" className="hover:text-yellow-400">تواصل معنا</a></li>
          </ul>
        </div>

        {/* معلومات التواصل */}
        <div>
          <h3 className="text-xl font-semibold text-yellow-400 mb-4">
            تواصل معنا
          </h3>

          <p>📍 الدمام - حي النهضة</p>
          <p>📞 0594165122</p>
          <p>📷 Instagram: hamsat.mazaaj</p>
          <p>👻 Snapchat: whisper_mood</p>
        </div>

      </div>

      <div className="border-t border-gray-700 py-5 text-center text-gray-400">
        © 2026 مقهى همسة مزاج - جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}