# PHM Workbench

An interactive frontend prototype for rotating-machinery predictive maintenance. Browse synthetic bearing, gearbox, and motor examples, or open the blueprint canvas to add nodes, connect steps, edit configurations, and save versions in your browser.

- [Live demo](https://phoenixsjtu.github.io/PHM-Workbench/)
- [Rotating Machinery PHM Datasets](https://github.com/phoenixsjtu/Rotating-Machinery-PHM-Datasets)

The demo shows representative interfaces for experiments, models, deployments, and monitoring. Blueprint execution is simulated. Dataset uploads, model training, and deployment require a backend.

## Run locally

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/PHM-Workbench/`. Run `npm run build` to export the site to `out/` for static hosting at `/PHM-Workbench/`.
