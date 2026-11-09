export const MAX_SAMPLES = 32_768;
export const MAX_CSV_BYTES = 2 * 1024 * 1024;

export type SignalColumn = { name: string; samples: number[] };

function csvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let closedQuote = false;

  function pushField() {
    row.push(field.trim());
    field = '';
    closedQuote = false;
  }

  function pushRow() {
    pushField();
    if (row.length > 1 || row[0]) rows.push(row);
    row = [];
  }

  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char !== '"') field += char;
      else if (source[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        quoted = false;
        closedQuote = true;
      }
    } else if (char === ',') {
      pushField();
    } else if (char === '\n' || char === '\r') {
      pushRow();
      if (char === '\r' && source[i + 1] === '\n') i++;
    } else if (char === '"' && !field && !closedQuote) {
      quoted = true;
    } else if (closedQuote ? !/\s/.test(char) : char === '"') {
      throw new Error('CSV 引号格式有误。');
    } else if (!closedQuote) {
      field += char;
    }
  }
  if (quoted) throw new Error('CSV 中有未闭合的引号。');
  pushRow();
  return rows;
}

const seconds = new Set(['time_s', 'timestamp_s', 't_s']);
const milliseconds = new Set(['time_ms', 'timestamp_ms', 't_ms']);
const timeNames = new Set([...seconds, ...milliseconds, 'time', 'timestamp', 't']);
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function parseSignalCsv(text: string) {
  const [headers, ...rows] = csvRows(text);
  if (!headers?.length || headers.some(header => !header) || new Set(headers).size !== headers.length) {
    throw new Error('CSV 首行需要唯一且非空的列名。');
  }
  if (rows.length < 4 || rows.length > MAX_SAMPLES) {
    throw new Error(`请提供 4 至 ${MAX_SAMPLES.toLocaleString('zh-CN')} 个采样点。`);
  }
  if (rows.some(row => row.length !== headers.length)) {
    throw new Error('CSV 的数据列数与表头不一致。');
  }

  const columns: SignalColumn[] = [];
  let clock: SignalColumn | undefined;
  for (const [index, name] of headers.entries()) {
    const cells = rows.map(row => row[index]);
    if (!cells.every(cell => decimal.test(cell))) continue;
    const samples = cells.map(Number);
    if (!samples.every(Number.isFinite)) continue;
    const key = name.toLowerCase();
    if (seconds.has(key) || milliseconds.has(key)) clock ??= { name: key, samples };
    if (!timeNames.has(key)) columns.push({ name, samples });
  }
  if (!columns.length) throw new Error('找不到完整的数值信号列。请检查空值和列名。');

  let rate: number | null = null;
  if (clock) {
    const times = clock.samples;
    const step = (times.at(-1)! - times[0]) / (times.length - 1);
    if (step > 0 && times.slice(1).every((time, i) => Math.abs(time - times[i] - step) <= step * 0.005)) {
      const inferred = (milliseconds.has(clock.name) ? 1000 : 1) / step;
      if (Number.isFinite(inferred)) rate = Number(inferred.toPrecision(8));
    }
  }
  return { columns, rowCount: rows.length, rate };
}

function signalMean(samples: number[]) {
  const first = samples[0];
  if (samples.every(value => value === first)) return first;
  return samples.reduce((sum, value) => sum + value / samples.length, 0);
}

// PHM Studio v3 utils/feature_calculator.py: the vibration RMS is measured after centering.
export function extractFeatures(samples: number[]) {
  const mean = signalMean(samples);
  let squares = 0;
  let absolute = 0;
  let peak = 0;
  for (const value of samples) {
    squares += (value - mean) ** 2;
    absolute += Math.abs(value);
    peak = Math.max(peak, Math.abs(value));
  }
  const rms = Math.sqrt(squares / samples.length);
  const kurtosis = rms > 0
    ? samples.reduce((sum, value) => sum + ((value - mean) / rms) ** 4, 0) / samples.length
    : null;
  return {
    rms,
    peak,
    crestFactor: rms > 0 ? peak / rms : 0,
    impulseFactor: absolute > 0 ? peak / (absolute / samples.length) : 0,
    kurtosis,
  };
}

function fft(real: Float64Array, imag: Float64Array, inverse = false) {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }
  for (let width = 2; width <= n; width *= 2) {
    const half = width / 2;
    const angle = (inverse ? 2 : -2) * Math.PI / width;
    for (let j = 0; j < half; j++) {
      const cos = Math.cos(j * angle);
      const sin = Math.sin(j * angle);
      for (let i = j; i < n; i += width) {
        const k = i + half;
        const r = real[k] * cos - imag[k] * sin;
        const s = real[k] * sin + imag[k] * cos;
        real[k] = real[i] - r;
        imag[k] = imag[i] - s;
        real[i] += r;
        imag[i] += s;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < n; i++) {
      real[i] /= n;
      imag[i] /= n;
    }
  }
}

function transform(signal: Float64Array) {
  const n = signal.length;
  if ((n & (n - 1)) === 0) {
    const imag = new Float64Array(n);
    fft(signal, imag);
    return { real: signal, imag };
  }

  // Bluestein convolution preserves v3's unpadded frequency grid for non-power-of-two lengths.
  const size = 2 ** Math.ceil(Math.log2(2 * n - 1));
  const real = new Float64Array(size);
  const imag = new Float64Array(size);
  const kernelReal = new Float64Array(size);
  const kernelImag = new Float64Array(size);
  for (let i = 0; i < n; i++) {
    const angle = Math.PI * ((i * i) % (2 * n)) / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    real[i] = signal[i] * cos;
    imag[i] = -signal[i] * sin;
    kernelReal[i] = cos;
    kernelImag[i] = sin;
    if (i) {
      kernelReal[size - i] = cos;
      kernelImag[size - i] = sin;
    }
  }
  fft(real, imag);
  fft(kernelReal, kernelImag);
  for (let i = 0; i < size; i++) {
    const r = real[i];
    real[i] = r * kernelReal[i] - imag[i] * kernelImag[i];
    imag[i] = r * kernelImag[i] + imag[i] * kernelReal[i];
  }
  fft(real, imag, true);
  for (let i = 0; i < n; i++) {
    const angle = Math.PI * ((i * i) % (2 * n)) / n;
    const r = real[i];
    real[i] = r * Math.cos(angle) + imag[i] * Math.sin(angle);
    imag[i] = imag[i] * Math.cos(angle) - r * Math.sin(angle);
  }
  return { real, imag };
}

// PHM Studio v3 backend/phm/handlers/common.py compute_signal_spectrum.
export function analyzeSpectrum(samples: number[], sampleRate: number) {
  const n = samples.length;
  const mean = signalMean(samples);
  let gain = 0;
  const tapered = Float64Array.from(samples, (value, i) => {
    const weight = n > 3 ? 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1))) : 1;
    gain += weight;
    return (value - mean) * weight;
  });
  const { real, imag } = transform(tapered);
  const resolution = sampleRate / n;
  const bins = Array.from({ length: Math.floor(n / 2) + 1 }, (_, i) => ({
    hz: i * resolution,
    amplitude: Math.hypot(real[i], imag[i]) * (i === 0 || i * 2 === n ? 1 : 2) / gain,
  }));
  const strongest = bins.slice(1).reduce((best, bin) => bin.amplitude > best.amplitude ? bin : best, bins[1]);
  const peak = strongest.amplitude > 0 ? strongest : null;
  return { bins, peak, resolution, nyquist: sampleRate / 2 };
}
