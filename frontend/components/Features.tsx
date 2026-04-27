export default function Features() {
  const features = [
    "Harvest timing prediction",
    "Mandi price forecasting",
    "Transport cost optimization",
    "Profit ranking",
    "Satellite crop monitoring",
    "Weather intelligence",
  ];

  return (
    <section className="bg-white py-20 text-center">
      <h2 className="text-3xl font-semibold mb-10">Features</h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="p-6 border rounded-xl">
            <p>{f}</p>
          </div>
        ))}
      </div>
    </section>
  );
}