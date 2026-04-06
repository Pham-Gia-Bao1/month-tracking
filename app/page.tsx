import {Dashboard} from "./components/Dashboard";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: '#E8E4DC' }}>
      <div className="phone-frame relative overflow-hidden rounded-[40px] shadow-2xl">
        <Dashboard />
      </div>
      {/* Desktop hint */}
      <p className="absolute bottom-4 text-xs opacity-40 font-sans hidden md:block"
        style={{ color: '#1A1714' }}>
        Optimized for iPhone 11 · 390×844
      </p>
    </main>
  );
}
