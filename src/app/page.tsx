'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Activity, ArrowUpRight, Cpu, Database, ShieldCheck } from 'lucide-react';
import { analyzeSpectrum, extractFeatures, MAX_CSV_BYTES, parseSignalCsv } from '../lib/signal';

const exampleCsv = '/PHM-Workbench/examples/bearing-vibration.csv';
const stages = [
  { id: 'import', title: '数据标准化', icon: Database },
  { id: 'features', title: '特征工程', icon: Cpu },
  { id: 'spectrum', title: '信号分析', icon: Activity },
];

type Dataset = ReturnType<typeof parseSignalCsv> & { name: string };
type Features = ReturnType<typeof extractFeatures>;
type Spectrum = ReturnType<typeof analyzeSpectrum>;
type Point = { x: number; y: number };

function format(value: number | null, digits = 4) {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
}

function plotPoints(points: Point[]) {
  const perBucket = Math.ceil(points.length / 450);
  if (perBucket <= 1) return points;
  const plotted: Point[] = [];
  for (let i = 0; i < points.length; i += perBucket) {
    const bucket = points.slice(i, i + perBucket);
    plotted.push(bucket.reduce((best, point) => point.y > best.y ? point : best));
  }
  return plotted;
}

function SignalChart({ points, title, unit, from, to, min, max, peak }: {
  points: Point[]; title: string; unit: string; from: number; to: number;
  min: number; max: number; peak?: number;
}) {
  const width = 700;
  const left = 61;
  const right = 22;
  const top = 15;
  const bottom = 34;
  const height = 202;
  const x = (value: number) => left + (value - from) / (to - from || 1) * (width - left - right);
  const y = (value: number) => height - bottom - (value - min) / (max - min || 1) * (height - top - bottom);
  const ticks = [0, .25, .5, .75, 1];
  return <figure className="chart">
    <figcaption>{title}</figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="plot">
      {ticks.map(tick => {
        const vertical = min + tick * (max - min);
        const horizontal = from + tick * (to - from);
        return <g key={tick}>
          <line x1={left} x2={width - right} y1={y(vertical)} y2={y(vertical)} />
          <line x1={x(horizontal)} x2={x(horizontal)} y1={top} y2={height - bottom} />
          <text x={left - 8} y={y(vertical) + 4} textAnchor="end">{format(vertical, 2)}</text>
          <text x={x(horizontal)} y={height - 11} textAnchor="middle">{format(horizontal, 2)}</text>
        </g>;
      })}
      {peak !== undefined && <line className="peak-line" x1={x(peak)} x2={x(peak)} y1={top} y2={height - bottom} />}
      <polyline points={plotPoints(points).map(point => `${x(point.x).toFixed(2)},${y(point.y).toFixed(2)}`).join(' ')} />
    </svg>
    <p className="plot-unit">{unit}</p>
  </figure>;
}

export default function Home() {
  const input = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<Dataset | null>(null);
  const [column, setColumn] = useState(0);
  const [rate, setRate] = useState('');
  const [features, setFeatures] = useState<Features | null>(null);
  const [spectrum, setSpectrum] = useState<Spectrum | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const channel = data?.columns[column];
  const sampleRate = Number(rate);
  const validRate = Number.isFinite(sampleRate) && sampleRate > 0 && sampleRate <= 10_000_000;
  const wave = channel?.samples.slice(0, 256) ?? [];
  const waveMin = Math.min(...wave);
  const waveMax = Math.max(...wave);

  function importText(text: string, name: string) {
    const parsed = parseSignalCsv(text);
    setData({ ...parsed, name });
    setColumn(0);
    setRate(parsed.rate === null ? '' : String(parsed.rate));
    setFeatures(null);
    setSpectrum(null);
    setAnnouncement(`已导入 ${name}，共 ${parsed.rowCount} 个采样点。`);
  }

  async function loadExample() {
    setError('');
    setBusy(true);
    try {
      const response = await fetch(exampleCsv);
      if (!response.ok) throw new Error('示例 CSV 暂时无法加载，请重试。');
      importText(await response.text(), 'bearing-vibration.csv');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '无法载入示例 CSV。');
    } finally {
      setBusy(false);
    }
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setError('');
    if (file.size > MAX_CSV_BYTES) {
      setError('请选择 2 MB 以内的 CSV。');
      return;
    }
    setBusy(true);
    try {
      importText(await file.text(), file.name);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '无法读取 CSV。');
    } finally {
      setBusy(false);
    }
  }

  function computeFeatures() {
    if (!channel) return;
    setFeatures(extractFeatures(channel.samples));
    setAnnouncement('振动特征计算完成。');
  }

  function computeSpectrum() {
    if (!channel || !validRate) return;
    const result = analyzeSpectrum(channel.samples, sampleRate);
    setSpectrum(result);
    setAnnouncement(result.peak ? `频谱计算完成，主频 ${format(result.peak.hz)} Hz。` : '频谱计算完成，信号没有交流分量。');
  }

  return <>
    <header className="studio-header">
      <div className="shell header-content">
        <a className="brand" href="#main"><span className="brand-icon"><ShieldCheck size={21} aria-hidden="true" /></span><span>PHM Studio</span></a>
        <a className="text-link" href="https://phoenixsjtu.github.io/?lang=zh#research">个人主页 <ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
    </header>
    <main className="shell" id="main">
      <div className="intro">
        <p className="intro-tag">旋转机械 · 振动分析</p>
        <h1>预测性维护工作台</h1>
        <p>从 CSV 导入到振动特征和频谱。载入合成轴承信号，即可在浏览器里完成一次分析。</p>
      </div>
      <div className="workspace">
        <aside className="workflow" aria-label="工作流程">
          <p>分析流程</p>
          <ol>
            {stages.map(({ id, title, icon: Icon }, i) => <li key={id}>
              <a href={`#${id}`}><Icon size={17} aria-hidden="true" /><span>{title}</span><small>{String(i + 1).padStart(2, '0')}</small></a>
            </li>)}
          </ol>
          <p className="privacy">CSV 读取和计算均在当前浏览器完成。</p>
        </aside>
        <div className="stages">
          <section className="stage" id="import" aria-labelledby="import-title">
            <div className="stage-title"><span>01</span><h2 id="import-title">数据标准化</h2></div>
            <p className="stage-description">载入示例或选择含数值信号列的 CSV，指定分析通道和采样率。</p>
            <div className="actions">
              <button className="primary" type="button" onClick={loadExample} disabled={busy}>{busy ? '正在读取…' : '载入示例 CSV'}</button>
              <button type="button" onClick={() => input.current?.click()} disabled={busy}>选择本地 CSV</button>
              <input ref={input} type="file" accept=".csv,text/csv" onChange={loadFile} hidden />
              <a className="text-link" href={exampleCsv} download>下载示例 <ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
            {data && <div className="loaded">
              <p className="data-file"><strong>{data.name}</strong><span>{format(data.rowCount, 0)} 个采样点</span></p>
              <div className="fields">
                <label>信号列<select value={column} onChange={event => {
                  setColumn(Number(event.target.value));
                  setFeatures(null);
                  setSpectrum(null);
                }}>
                  {data.columns.map(({ name }, i) => <option key={name} value={i}>{name}</option>)}
                </select></label>
                <label>采样率 (Hz)<input type="number" min="0" max="10000000" step="any" value={rate} onChange={event => {
                  setRate(event.target.value);
                  setSpectrum(null);
                }} placeholder="输入采样率" /></label>
              </div>
              {!validRate && <p className="hint">计算频谱前请输入大于 0 且不超过 10 MHz 的采样率。</p>}
              <SignalChart title={`时域波形 · 前 ${wave.length} 个采样点`} unit={validRate ? '时间 (ms)' : '样本序号'}
                points={wave.map((value, i) => ({ x: validRate ? i * 1000 / sampleRate : i, y: value }))}
                from={0} to={validRate ? (wave.length - 1) * 1000 / sampleRate : wave.length - 1}
                min={waveMin === waveMax ? waveMin - 1 : waveMin} max={waveMin === waveMax ? waveMax + 1 : waveMax} />
            </div>}
          </section>
          <section className="stage" id="features" aria-labelledby="features-title">
            <div className="stage-title"><span>02</span><h2 id="features-title">特征工程</h2></div>
            <p className="stage-description">按 v3 的定义计算去均值 RMS、峰值、峰值因子、脉冲因子和峭度。</p>
            <button className="primary" type="button" onClick={computeFeatures} disabled={!channel || busy}>提取特征</button>
            {features && <dl className="results" aria-label="特征结果">
              <div><dt>去均值 RMS</dt><dd>{format(features.rms)}</dd></div>
              <div><dt>峰值</dt><dd>{format(features.peak)}</dd></div>
              <div><dt>峰值因子</dt><dd>{format(features.crestFactor)}</dd></div>
              <div><dt>脉冲因子</dt><dd>{format(features.impulseFactor)}</dd></div>
              <div><dt>峭度</dt><dd>{format(features.kurtosis)}</dd></div>
            </dl>}
          </section>
          <section className="stage" id="spectrum" aria-labelledby="spectrum-title">
            <div className="stage-title"><span>03</span><h2 id="spectrum-title">信号分析</h2></div>
            <p className="stage-description">去均值并加 Hann 窗，计算单边幅值频谱。</p>
            <button className="primary" type="button" onClick={computeSpectrum} disabled={!channel || !validRate || busy}>计算频谱</button>
            {spectrum && <>
              <dl className="results" aria-label="频谱结果">
                <div><dt>主频</dt><dd>{spectrum.peak ? `${format(spectrum.peak.hz)} Hz` : '—'}</dd></div>
                <div><dt>主频幅值</dt><dd>{format(spectrum.peak?.amplitude ?? null)}</dd></div>
                <div><dt>频率分辨率</dt><dd>{format(spectrum.resolution)} Hz</dd></div>
              </dl>
              <SignalChart title="单边幅值频谱" unit="频率 (Hz)"
                points={spectrum.bins.map(bin => ({ x: bin.hz, y: bin.amplitude }))}
                from={0} to={spectrum.nyquist} min={0} max={Math.max(...spectrum.bins.map(bin => bin.amplitude)) || 1}
                peak={spectrum.peak?.hz} />
            </>}
          </section>
        </div>
      </div>
      <p className="sr-only" role="status">{announcement}</p>
    </main>
    <footer className="shell studio-footer"><span>PHM Studio · v3 在线预览</span><a className="text-link" href="https://github.com/phoenixsjtu/PHM-Workbench">源码 <ArrowUpRight size={14} aria-hidden="true" /></a></footer>
  </>;
}
