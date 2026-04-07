import { Dashboard } from './components/Dashboard';

export default function Page() {
  return (
    <main>
      <div className="phone-frame relative overflow-hidden">
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