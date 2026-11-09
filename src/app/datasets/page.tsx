const datasets = [
  { name: 'Bearing vibration windows', rows: '12,000', cols: '24', updated: 'Snapshot 01', owner: 'Synthetic' },
  { name: 'Gearbox spectrum features', rows: '8,400', cols: '32', updated: 'Snapshot 02', owner: 'Synthetic' },
  { name: 'Motor current and speed', rows: '6,000', cols: '16', updated: 'Snapshot 03', owner: 'Synthetic' },
];

export default function DatasetsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Datasets</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Signal datasets</h1>
          </div>
          <button type="button" disabled className="rounded-full border border-cyan-400/20 bg-cyan-400/10 cursor-not-allowed px-4 py-2 text-sm opacity-60 text-cyan-100">
            Upload unavailable
          </button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/25">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Name</th>
                  <th className="px-5 py-4 font-medium">Rows</th>
                  <th className="px-5 py-4 font-medium">Columns</th>
                  <th className="px-5 py-4 font-medium">Snapshot</th>
                  <th className="px-5 py-4 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset) => (
                  <tr key={dataset.name} className="border-t border-white/10 text-slate-200">
                    <td className="px-5 py-4 font-medium text-white">{dataset.name}</td>
                    <td className="px-5 py-4">{dataset.rows}</td>
                    <td className="px-5 py-4">{dataset.cols}</td>
                    <td className="px-5 py-4">{dataset.updated}</td>
                    <td className="px-5 py-4">{dataset.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Selected dataset</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Bearing vibration windows</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Rows</p>
                  <p className="mt-1 text-xl font-semibold text-white">12,000</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Columns</p>
                  <p className="mt-1 text-xl font-semibold text-white">24</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5 text-sm text-slate-300">
              Example fields include asset ID, shaft speed, RMS vibration and fault class.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
