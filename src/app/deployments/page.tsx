const deployments = [
  { name: 'Bearing rig / B-01', model: 'Bearing fault classifier', traffic: '100%', state: 'Simulated' },
  { name: 'Gearbox rig / G-02', model: 'Gearbox anomaly detector', traffic: '20%', state: 'Simulated' },
  { name: 'Motor rig / M-01', model: 'Motor state classifier', traffic: '100%', state: 'Simulated' },
];

export default function DeploymentsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Deployments</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Deployment examples</h1>
          </div>
          <button type="button" disabled className="rounded-full border border-emerald-400/20 bg-emerald-400/10 cursor-not-allowed px-4 py-2 text-sm opacity-60 text-emerald-100">
            Deployment unavailable
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/25">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-4 font-medium">Deployment</th>
                <th className="px-5 py-4 font-medium">Model</th>
                <th className="px-5 py-4 font-medium">Example traffic</th>
                <th className="px-5 py-4 font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((item) => (
                <tr key={item.name} className="border-t border-white/10 text-slate-200">
                  <td className="px-5 py-4 font-medium text-white">{item.name}</td>
                  <td className="px-5 py-4">{item.model}</td>
                  <td className="px-5 py-4">{item.traffic}</td>
                  <td className="px-5 py-4">{item.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
