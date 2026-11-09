# PHM Studio

An online vibration-analysis preview adapted from the **PHM_UI_v3_Final** workbench. Open the example CSV, extract time-domain features, and compute the single-sided amplitude spectrum in the browser.

[Open PHM Studio](https://phoenixsjtu.github.io/PHM-Workbench/) · [Example CSV](public/examples/bearing-vibration.csv)

1. **Data standardization.** Load the bundled synthetic signal or select a comma-separated CSV with named columns, up to 2 MB and 32,768 samples. Select a numeric signal column. Set the sample rate manually or let the tool infer it from a uniformly spaced `time_s` or `time_ms` column.
2. **Feature engineering.** Compute centered RMS, peak amplitude, crest factor, impulse factor, and Pearson kurtosis using the corresponding definitions in v3's `utils/feature_calculator.py`.
3. **Signal analysis.** The browser implementation follows v3's `compute_signal_spectrum` in `backend/phm/handlers/common.py`, including mean removal, Hann window, amplitude correction, and the original frequency grid. The bundled 1,024 Hz example has a dominant component at 50 Hz.

CSV parsing and analysis run locally in the browser. The preview uses the three modules above. The original v3 desktop workflow and Flask API live separately.

## Develop

```sh
npm ci
npm run dev
```

Open [localhost:3000/PHM-Workbench/](http://localhost:3000/PHM-Workbench/). Run `npm run build` to export the site to `out/` for GitHub Pages.
