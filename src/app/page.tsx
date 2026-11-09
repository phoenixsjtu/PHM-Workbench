'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, Database, Gauge, Layers3, PanelLeft, ShieldCheck, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

const kpis = [
  { label: '设备案例', value: '3', delta: '轴承、齿轮箱、电机' },
  { label: '实验快照', value: '3', delta: '故障分类与异常检测' },
  { label: '模型示例', value: '3', delta: '供界面演示' },
  { label: '告警样例', value: '2', delta: '振动与数据漂移' },
];

const activity = [
  { title: '轴承故障分类', status: '实验示例', meta: 'XGBoost · 振动特征' },
  { title: '齿轮箱异常检测', status: '模型示例', meta: 'Isolation Forest · 频谱特征' },
  { title: '电机状态监测', status: '监控示例', meta: '电流与转速 · 合成数据' },
];

const steps = [
  { title: '信号', desc: '查看振动、电流和转速示例。' },
  { title: '特征', desc: '配置时域和频域特征节点。' },
  { title: '编排', desc: '在画布上添加、连接和编辑节点。' },
  { title: '版本', desc: '保存并比较本地工作流快照。' },
];

const nav = [
  { label: '总览', href: '/overview', icon: Gauge },
  { label: '数据集', href: '/datasets', icon: Database },
  { label: '实验', href: '/experiments', icon: Brain },
  { label: '蓝图', href: '/blueprints', icon: Layers3 },
  { label: '模型', href: '/models', icon: BarChart3 },
  { label: '部署', href: '/deployments', icon: ShieldCheck },
  { label: '监控', href: '/monitoring', icon: Gauge },
];

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-[color:var(--muted)]">{children}</span>;
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--text)] shadow-[var(--shadow)] backdrop-blur transition hover:-translate-y-0.5"
      type="button"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {theme === 'dark' ? '切换到浅色' : '切换到深色'}
    </button>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen text-[color:var(--text)]">
      <section className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-6 py-6 lg:px-8">
        <aside className="hidden w-[290px] shrink-0 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur xl:block">
          <div className="flex items-center gap-3 border-b border-[color:var(--border)] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] text-white shadow-lg shadow-cyan-500/20">
              <PanelLeft size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-[color:var(--text)]">PHM Workbench</p>
              <p className="text-xs text-[color:var(--muted)]">预测性维护工作台</p>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[color:var(--muted)] transition hover:bg-[color:var(--bg-elevated)] hover:text-[color:var(--text)]"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">工作区</p>
            <p className="mt-2 text-sm font-medium text-[color:var(--text)]">旋转机械状态监测</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">轴承 · 齿轮箱 · 电机</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] px-6 py-5 shadow-[var(--shadow)] backdrop-blur">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusPill>预测性维护</StatusPill>
                  <StatusPill>旋转机械</StatusPill>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  预测性维护工作台
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] md:text-base">
                  从振动信号到故障诊断。体验蓝图编排和本地版本管理，并浏览实验、模型与监控的示例快照。
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ThemeButton />
              </div>
            </div>

            <nav aria-label="工作区导航" className="mt-5 flex flex-wrap gap-2 xl:hidden">
              {nav.map(({ label, href }) => (
                <Link key={href} href={href} className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-sm">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((item) => (
                <div key={item.label} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-4">
                  <p className="text-xs text-[color:var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[color:var(--text)]">{item.value}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{item.delta}</p>
                </div>
              ))}
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--muted)]">工作流</p>
                  <h2 className="mt-2 text-xl font-semibold text-[color:var(--text)]">诊断工作流</h2>
                </div>
                <Link
                  href="/blueprints"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-4 py-2 text-sm text-[color:var(--text)] transition hover:bg-[color:var(--panel-strong)]"
                >
                  打开蓝图
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-sm font-semibold text-[color:var(--accent)]">
                      0{index + 1}
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-[color:var(--text)]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--muted)]">示例记录</p>
              <h2 className="mt-2 text-xl font-semibold text-[color:var(--text)]">设备与模型</h2>
              <div className="mt-5 space-y-3">
                {activity.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[color:var(--text)]">{item.title}</p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{item.meta}</p>
                      </div>
                      <span className="rounded-full border border-[color:var(--good)]/20 bg-[color:var(--good)]/10 px-3 py-1 text-xs text-[color:var(--good)]">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-[color:var(--warn)]/20 bg-[color:var(--warn)]/10 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--warn)]">提示</p>
                <p className="mt-2 text-sm text-[color:var(--text)]">告警样例显示齿轮箱 G-02 振动 RMS 升高。</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">监控页面展示对应的合成告警。</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
