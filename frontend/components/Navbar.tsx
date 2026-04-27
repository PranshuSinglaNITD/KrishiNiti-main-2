export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      <h1 className="text-xl font-bold">KrishiNiti</h1>
      <div className="flex gap-4">
        <a href="/demo" className="text-sm">Demo</a>
        <button className="px-4 py-2 bg-green-600 text-white rounded-full">
          Try Now
        </button>
      </div>
    </nav>
  );
}