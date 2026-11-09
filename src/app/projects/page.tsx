export default function ProjectsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Projects</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Project hub</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          This sample workspace groups bearing fault classification, gearbox anomaly detection, and motor state monitoring.
        </p>
      </div>
    </main>
  );
}
