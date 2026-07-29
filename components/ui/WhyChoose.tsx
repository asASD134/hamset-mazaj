export default function WhyChoose() {
  return (
    <section className="py-16 bg-zinc-950 px-6">

      <h2 className="text-4xl text-yellow-400 font-bold text-center mb-10">
        لماذا تختار همسة مزاج؟
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        <div className="bg-black border border-yellow-400/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">☕</div>

          <h3 className="text-2xl text-yellow-400 font-bold mb-3">
            قهوة مختارة
          </h3>

          <p>
            نقدم قهوة بجودة عالية ومذاق مميز لعشاق القهوة.
          </p>
        </div>


        <div className="bg-black border border-yellow-400/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🛋️</div>

          <h3 className="text-2xl text-yellow-400 font-bold mb-3">
            جلسات فاخرة
          </h3>

          <p>
            أجواء هادئة ومريحة تناسب العائلة والأصدقاء.
          </p>
        </div>


        <div className="bg-black border border-yellow-400/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">⭐</div>

          <h3 className="text-2xl text-yellow-400 font-bold mb-3">
            تجربة مميزة
          </h3>

          <p>
            نهتم بكل التفاصيل لنقدم لك تجربة لا تنسى.
          </p>
        </div>

      </div>

    </section>
  );
}