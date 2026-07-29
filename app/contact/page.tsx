export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* عنوان الصفحة */}
      <section className="py-14 text-center">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">
          📞 تواصل معنا
        </h1>

        <p className="text-gray-300">
          يسعدنا استقبالكم يوميًا في مقهى همسة مزاج.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">

        <div className="grid md:grid-cols-2 gap-8">

          {/* معلومات التواصل */}
          <div className="bg-zinc-900 rounded-3xl p-8 border border-yellow-500/20">

            <h2 className="text-3xl text-yellow-400 font-bold mb-6">
              معلومات التواصل
            </h2>

            <div className="space-y-5 text-lg">

              <p>📍 الدمام - حي النهضة - بجوار صيدلية الدواء</p>

              <p>📞 0594165122</p>

              <p>📸 Instagram: hamsat.mazaaj</p>

              <p>👻 Snapchat: whisper_mood</p>

              <p>🕒 يوميًا من 6:00 مساءً حتى 2:00 صباحًا</p>

            </div>

            <div className="flex flex-wrap gap-4 mt-8">

              <a
                href="tel:0594165122"
                className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
              >
                📞 اتصال
              </a>

              <a
                href="https://wa.me/966594165122"
                target="_blank"
                className="bg-green-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition"
              >
                💬 واتساب
              </a>

            </div>

          </div>

          {/* مكان الخريطة */}
          <div className="bg-zinc-900 rounded-3xl p-8 border border-yellow-500/20">

            <h2 className="text-3xl text-yellow-400 font-bold mb-6">
              📍 موقع المقهى
            </h2>

            <div className="h-80 rounded-2xl bg-zinc-800 flex items-center justify-center text-gray-400">
              سيتم إضافة خريطة Google هنا في الخطوة القادمة.
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}