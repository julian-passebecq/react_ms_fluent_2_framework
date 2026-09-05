# Deliberately deferred to V5 or later

Do not pull these into V4 unless required to fix a V4 regression:

- VS Code extension
- Storybook MCP server if it needs meaningful custom infrastructure
- published npm SDK/package release process
- DuckDB-WASM or Pyodide execution
- Spark/Jupyter kernels
- backend/auth/cloud sync
- cross-device progress sync
- D3 Power BI renderer SDK
- GeoStory system
- new ML renderer families for logistic boundary, random forest, boosting, k-NN, SVM, k-means, PCA or neural nets
- full consolidation of all 28 legacy renderer families
- live provider/service knowledge monitoring
- news/mail/social integrations
- Data Forge integration

V5 should be chosen after V4 exposes what still produces real friction.
