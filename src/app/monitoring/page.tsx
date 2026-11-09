const metrics = [
  { label: 'Gearbox vibration RMS', value: '3.2 mm/s', delta: '+0.6 mm/s' },
  { label: 'Motor temperature', value: '58 °C', delta: '+3 °C' },
  { label: 'Drift score', value: '0.24', delta: '+0.04' },
];

export default function MonitoringPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Monitoring</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Operational health</h1>
          </div>
          <span className="text-sm text-slate-400">Example window: 24h</span>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
              <p className="mt-2 text-sm text-emerald-300">{metric.delta}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
            <h2 className="text-lg font-semibold text-white">Trend charts</h2>
            <div className="mt-4 grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-white/10 bg-white/3 text-sm text-slate-500">
              Illustrative snapshot for gearbox G-02 and motor M-01.
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
            <h2 className="text-lg font-semibold text-white">Alerts</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/8 p-4">G-02 vibration RMS increased relative to its example baseline.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">M-01 current distribution shifted at higher speed.</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
