# AI prompt cookbook

These prompts are examples of the intended product usage. AI should generate semantic specs, then ConceptMotion renders them.

## Cloud architecture

> Create a light-theme Microsoft-modern Fabric architecture. Show relational sources and event streams feeding Fabric pipelines/eventstreams, then Lakehouse/Eventhouse, notebooks/SQL, semantic model and Power BI. Distinguish hot path and cold path. Animate only ingestion and serving flow. Output a `cloud-diagram` spec.

## Azure secure app

> Explain a private Azure App Service architecture with Application Gateway/WAF, VNet integration, private endpoints to Azure SQL, Key Vault and Storage, plus Entra ID and Monitor. Use containers for VNet and subnets and a security tone for private paths. Output a `cloud-diagram` spec.

## Star schema

> Build a clean Power BI sales star schema. FactSales grain is one row per order line. Include Date, Product, Customer and Store dimensions. Show PK/FK columns and relationship cardinality, but hide low-value technical columns. Output a `data-model` spec.

## ERP -> semantic model lineage

> Show source Orders and OrderRows becoming staging models, then FactSales, dimensions, semantic model and executive report. Group assets by bronze/silver/gold/semantic/report. Label each transformation. Output a `lineage` spec.

## Animated troubleshooting path

> Trace one failed event through Event Hub -> stream processor -> dead-letter queue -> replay job -> curated table. Use packet animation for the event and a red warning state only where the failure occurs. Output a cloud/lineage spec plus storyboard frames if needed.
