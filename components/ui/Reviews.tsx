export default function Reviews() {
  return (
    <section className="py-16 bg-zinc-950 px-6">
      <h2 className="text-4xl text-yellow-400 font-bold text-center mb-10">
        آراء عملائنا
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        <div className="bg-black border border-yellow-400/30 rounded-2xl p-8 text-center">
          <div className="text-yellow-400 text-2xl mb-4">
            ⭐⭐⭐⭐⭐
          </div>

          <p className="mb-4">
            قهوة رائعة وأجواء جميلة، المكان مريح جدًا.
          </p>

          <h3 className="text-yellow-400 font-bold">
            أحمد
          </h3>
        </div>

        <div className="bg-black border border-yellow-400/30 rounded-2xl p-8 text-center">
          <div className="text-yellow-400 text-2xl mb-4">
            ⭐⭐⭐⭐⭐
          </div>

          <p className="mb-4">
            من أفضل المقاهي، الخدمة ممتازة والجلسات راقية.
          </p>

          <h3 className="text-yellow-400 font-bold">
            محمد
          </h3>
        </div>

        <div className="bg-black border border-yellow-400/30 rounded-2xl p-8 text-center">
          <div className="text-yellow-400 text-2xl mb-4">
            ⭐⭐⭐⭐⭐
          </div>

          <p className="mb-4">
            تجربة جميلة وسأكرر الزيارة بالتأكيد.
          </p>

          <h3 className="text-yellow-400 font-bold">
            خالد
          </h3>
        </div>

      </div>
    </section>
  );
}