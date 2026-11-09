import { ArrowUpRight, Gauge, Layers3, ShieldCheck, Sparkles } from 'lucide-react';

const cards = [
  { label: 'Equipment examples', value: '3', accent: 'from-cyan-500/30 to-blue-500/10' },
  { label: 'Experiment examples', value: '3', accent: 'from-emerald-500/25 to-teal-500/10' },
  { label: 'Model examples', value: '3', accent: 'from-violet-500/25 to-fuchsia-500/10' },
  { label: 'Alert examples', value: '2', accent: 'from-amber-500/25 to-orange-500/10' },
];

const recent = [
  { name: 'Bearing fault classification', meta: 'XGBoost · vibration features', status: 'Experiment' },
  { name: 'Gearbox anomaly detection', meta: 'Isolation Forest · spectral features', status: 'Model' },
  { name: 'Motor state monitoring', meta: 'Motor current and shaft speed', status: 'Monitor' },
];

export default function OverviewPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Overview</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Equipment health overview</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Sparkles size={16} className="text-cyan-300" />
            Synthetic equipment snapshots
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-5`}>
              <p className="text-sm text-slate-300">{card.label}</p>
              <p className="mt-4 text-4xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Lifecycle summary</h2>
              <span className="text-xs text-slate-500">Example window</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                { icon: Gauge, title: 'Signal inputs', desc: 'Bearing, gearbox and motor examples' },
                { icon: Layers3, title: 'Blueprint versions', desc: 'Editable workflow and local snapshots' },
                { icon: ShieldCheck, title: 'Monitoring', desc: 'Example drift and vibration alerts' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <Icon className="text-cyan-300" size={20} />
                    <p className="mt-4 font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
              <ArrowUpRight size={18} className="text-slate-500" />
            </div>
            <div className="mt-4 space-y-3">
              {recent.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
