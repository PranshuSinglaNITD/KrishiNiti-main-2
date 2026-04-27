export default function Workflow() {
  const steps = [
    "Input crop details",
    "Fetch weather + crop data",
    "Predict harvest timing",
    "Analyze mandi prices",
    "Compute profit",
    "Give recommendation",
  ];

  return (
    <section className="bg-white py-20 text-center">
      <h2 className="text-3xl font-semibold mb-10">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="p-6 border rounded-xl">
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}