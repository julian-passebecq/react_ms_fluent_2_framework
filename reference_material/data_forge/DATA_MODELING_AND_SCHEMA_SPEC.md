# Data Modeling & Schema Rules

This is a core V1 feature.

The generator should not merely produce files. It must understand the **business grain and model** it generated.

---

# 1. Maintain separate model layers

Do not pretend the operational source schema and analytical Gold model are the same.

```text
Operational / source
        |
        v
Bronze: raw-ish landing
        |
        v
Silver: cleaned canonical entities/events
        |
        v
Gold: dimensional/star model
        |
        v
Semantic model / BI
```

## Operational example

```text
Customer
Order
OrderLine
Shipment
ShipmentEvent
Payment
Return
SupportTicket
Review
```

## Gold example

```text
DimDate
DimCustomer
DimProduct
DimStore
DimCarrier

FactSales
FactShipment
FactReturn
FactSupport
FactCustomerExperience
```

---

# 2. Every fact table needs an explicit grain

Examples:

```text
FactSales:
one row per order line

FactShipment:
one row per shipment

FactCustomerExperience:
one row per completed order
```

Store grain in `DataModelSpec`.

Never generate a fact table without documenting its grain.

---

# 3. Distinguish keys

## Business/natural key
Example:
`CustomerId`

Comes from source/business system.

## Surrogate key
Example:
`CustomerKey`

Warehouse-generated integer/hash key used to represent a dimension version.

This matters for SCD2.

---

# 4. SCD Type 2 dimension structure

Typical generated fields:

```text
CustomerKey
CustomerId
...
ValidFrom
ValidTo
IsCurrent
```

Rules:
- one current row per business key
- non-overlapping validity intervals
- facts must join to the correct historical version when the scenario requires point-in-time accuracy.

Generate validation tests for these rules.

---

# 5. Relationship metadata

Represent:

- source table
- source column(s)
- target table
- target column(s)
- cardinality
- optional/required
- role
- semantic filter recommendation where relevant.

Examples:

```text
DimCustomer 1 -> * FactSales
DimProduct  1 -> * FactSales
DimDate     1 -> * FactSales
```

Do not default to bidirectional semantic filtering.

---

# 6. Role-playing dimensions

For dates, explicitly model roles such as:
- Order Date
- Ship Date
- Delivery Date
- Return Date.

The physical Gold model may use one `DimDate`.
The semantic handoff should identify relationship roles/active-inactive intent.

---

# 7. Many-to-many

Do not hide many-to-many relationships.

Where needed:
- bridge table
- factless fact
- explicit relationship metadata.

Generate a challenge when a naive direct join would create fanout.

---

# 8. Fact types

Support concept metadata for:

## Transaction fact
e.g. sales/order line.

## Periodic snapshot
e.g. daily inventory.

## Accumulating snapshot
e.g. order lifecycle milestones.

## Factless fact
e.g. eligibility/attendance/event occurrence.

V1 only needs transaction facts, but the model should allow future types.

---

# 9. Measures

Classify measures where useful:

- additive
- semi-additive
- non-additive / ratio.

Examples:

```text
Revenue        additive
Inventory      semi-additive over time
Margin %       non-additive ratio
```

This helps downstream Power BI/DAX generation.

---

# 10. DataModelSpec is canonical

The following must be derived from it, not maintained separately:

```text
SQL DDL
Mermaid ER diagram
schema documentation
dbt source YAML
relationship metadata
Power BI semantic handoff
```

This prevents model drift.

---

# 11. Source schema vs semantic model

The semantic model may intentionally:
- hide technical keys
- add friendly labels
- add hierarchies
- expose measures
- omit staging tables.

Do not mirror every source column into Power BI.

---

# 12. Validation

Generate tests for:

- PK uniqueness
- FK integrity
- one-current-row SCD2
- validity interval overlap
- expected grain
- non-null required keys
- Gold reconciliation
- KPI reconciliation.
