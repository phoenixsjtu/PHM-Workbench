const models = [
  { name: 'Bearing fault classifier', score: '0.947 macro F1', explain: 'RMS, kurtosis', deploy: 'Reference' },
  { name: 'Gearbox anomaly detector', score: '0.931 AUROC', explain: 'Gear mesh bands', deploy: 'Reference' },
  { name: 'Motor state classifier', score: '0.912 macro F1', explain: 'Current, speed', deploy: 'Reference' },
];

export default function ModelsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Models</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Model registry</h1>
          </div>
          <button type="button" disabled className="rounded-full border border-white/10 bg-white/5 cursor-not-allowed px-4 py-2 text-sm opacity-60 text-slate-200">
            Comparison unavailable
          </button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/25">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Model</th>
                  <th className="px-5 py-4 font-medium">Score</th>
                  <th className="px-5 py-4 font-medium">Example features</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={model.name} className="border-t border-white/10 text-slate-200">
                    <td className="px-5 py-4 font-medium text-white">{model.name}</td>
                    <td className="px-5 py-4">{model.score}</td>
                    <td className="px-5 py-4">{model.explain}</td>
                    <td className="px-5 py-4">{model.deploy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Model detail</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Bearing fault classifier</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">RMS and kurtosis</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Macro F1 example</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Normal · inner race · outer race</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
