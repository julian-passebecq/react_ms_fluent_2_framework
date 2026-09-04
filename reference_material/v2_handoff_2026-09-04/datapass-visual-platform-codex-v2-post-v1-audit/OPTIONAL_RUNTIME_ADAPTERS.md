# Optional runtime adapters

## V2 principle

The learning UI must remain useful without execution. Runtime is an edge capability.

## RuntimeLauncher

Create a generic launch component/contract for safe configured targets:

- download original `.ipynb`;
- open a trusted external Colab URL;
- open configured Databricks guidance/workspace URL;
- open VS Code/download instructions;
- future Voila provider;
- future Mercury provider.

Do not accept arbitrary untrusted base URLs from lesson content.

## PySpark

V2 PySpark is display-only. No Spark execution adapter is required.

Future options that must remain outside core:

- Spark Connect service;
- Databricks notebook/job integration;
- Jupyter gateway;
- Kubernetes/Minikube/Kind labs.

## Voila / Mercury

Keep only provider contracts/configuration if useful. Do not bundle/start servers.

- Voila: Jupyter-native rendered notebook runtime;
- Mercury: notebook-as-reactive-app runtime.

## Streamlit

Keep as a future developer/prototype bridge. No Streamlit main app in V2.

## FastAPI

Keep as a future optional lab/gateway. No mandatory backend in V2.

## Browser SQL/Python execution

This is stretch-only after all required gates pass.

Preferred future direction:

- DuckDB-WASM for compatible SQL/course CSV exercises;
- Pyodide for selected Python basics/pandas exercises.

If implemented as a stretch:

- isolate behind an `ExecutionAdapter`;
- lazy-load the engine;
- use Web Workers where appropriate;
- impose time/memory limits where available;
- never expose the adapter as universal correctness judging;
- keep the no-execution mode fully functional.
