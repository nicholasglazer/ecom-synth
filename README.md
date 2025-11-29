# ecom-synth

**Synthetic E-Commerce Conversion Funnel Data Generator**

Generate realistic e-commerce datasets capturing the complete customer journey from social media engagement to purchase. Designed for AI/ML training, analytics testing, and database development.

---

## Overview

This tool generates interconnected synthetic data that models real e-commerce behavior:

- **Social engagement** → **Interest** → **Consideration** → **Purchase**
- Complete conversion funnel metrics at every stage
- Time-series data for forecasting and trend analysis
- Customer journey event streams for ML training

Compatible with PostgreSQL, [HyperCDB](https://github.com/hyperc-ai/hypercdb), and standard analytics tools.

---

## Quick Start

```bash
# Install dependencies
npm install

# Generate dataset (medium scale, all formats)
npm run generate

# Generate with specific scale
npm run generate:small   # ~4K records - quick testing
npm run generate:medium  # ~50K records - development
npm run generate:large   # ~300K records - production testing
```

### Output Formats

Data exports to `data/` directory:

| Format | Location | Use Case |
|--------|----------|----------|
| CSV | `data/csv/` | pandas, Excel, data analysis |
| JSON | `data/json/` | APIs, web applications |
| SQL | `data/sql/` | PostgreSQL, database import |

---

## Generated Data

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `products` | Product catalog | price, inventory, category |
| `product_variants` | SKU-level data | size, color, stock |
| `inventory_history` | Stock changes over time | quantity, source, timestamp |
| `social_posts` | Social media content | engagement, linked products |
| `post_metrics` | Engagement analytics | impressions, reach, engagement rate |
| `garment_bindings` | Product-content associations | **conversion funnel metrics** |
| `conversations` | Customer interactions | state, outcome, purchase attribution |
| `orders` | Transactions | amount, attribution, customer |

### Analytics Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `customer_journeys` | Event stream | event type, funnel stage, conversion |
| `daily_aggregates` | Pre-computed metrics | daily KPIs, seasonality flags |
| `customer_profiles` | Customer analytics | LTV, segment, behavior patterns |
| `demand_forecasts` | Prediction data | predicted vs actual demand |

---

## Conversion Funnel Model

The generator creates realistic funnel progression based on industry research:

```
Awareness (100%)
    ↓ 0.6-1.2% engage (Rival IQ 2024)
Interest (~1%)
    ↓ 2-8% start DM conversation
Consideration (~0.05%)
    ↓ 60-85% request photo
Try-On (~0.03%)
    ↓ 15-30% purchase (after 77% cart abandonment)
Purchase (~0.01%)
```

Each record tracks:
- `total_triggers` → `total_dm_conversations` → `photos_received` → `successful_generations` → `purchases`
- Calculated conversion rates at each stage
- Revenue attribution

---

## Research-Backed Parameters

All rates are based on 2024-2025 industry research:

| Parameter | Value | Source |
|-----------|-------|--------|
| Instagram engagement rate | 0.6-1.2% | Rival IQ 2024 |
| DM-to-sale conversion | 5-25% | Napolify 2025 |
| Cart abandonment (fashion) | 77.1% | Dynamic Yield |
| Mobile traffic share | 70% | Smart Insights |
| Desktop conversion boost | 1.7x | Dynamic Yield |
| November sales boost | +29% | Adobe Holiday Report |
| Virtual try-on conversion lift | +44% | Grand View Research |

See `src/config.js` for full parameter documentation with sources.

---

## Configuration

### Scale Presets

```bash
node src/index.js --scale small    # 2 workspaces, 30 days
node src/index.js --scale medium   # 5 workspaces, 90 days
node src/index.js --scale large    # 10 workspaces, 180 days
```

### Custom Configuration

Edit `src/config.js` to adjust:

- Conversion funnel rates
- Pricing distributions
- Inventory patterns
- Geographic distribution
- Customer segments
- Seasonality weights

---

## Database Import

### PostgreSQL

```bash
# Load schema first, then data
psql -d your_database -f data/sql/schema.sql
psql -d your_database -f data/sql/all_data.sql
```

### HyperCDB

For AI Planning with [HyperCDB](https://github.com/hyperc-ai/hypercdb):

```bash
# 1. Start HyperCDB container
docker run -d --name hypercdb -p 8493:8493 hypercdb/hypercdb

# 2. Wait for startup (about 10 seconds)
sleep 10

# 3. Create database
docker exec hypercdb /opt/hyperc/postgres/bin/psql -U postgres \
  -c "CREATE DATABASE ecom OWNER pguser;"

# 4. Copy SQL files to container
docker cp data/sql/schema.sql hypercdb:/tmp/
docker cp data/sql/all_data.sql hypercdb:/tmp/

# 5. Load schema first, then data
docker exec hypercdb /opt/hyperc/postgres/bin/psql -U pguser -d ecom \
  -f /tmp/schema.sql
docker exec hypercdb /opt/hyperc/postgres/bin/psql -U pguser -d ecom \
  -f /tmp/all_data.sql

# 6. Initialize AI Planning (via proxy port 8493)
# Option A: If you have psql installed locally
psql -h localhost -p 8493 -U pguser -d ecom -c "TRANSIT INIT;"

# Option B: Using Docker (no local psql needed)
docker run --rm --network host postgres:14-alpine \
  psql -h localhost -p 8493 -U pguser -d ecom -c "TRANSIT INIT;"
```

All tables have PRIMARY KEYs as required by HyperCDB.

**Verify it works:**
```bash
docker run --rm --network host postgres:14-alpine \
  psql -h localhost -p 8493 -U pguser -d ecom \
  -c "SELECT COUNT(*) FROM products;"
```

### Python/pandas

```python
import pandas as pd

# Load individual tables
products = pd.read_csv('data/csv/products.csv')
journeys = pd.read_csv('data/csv/customer_journeys.csv')

# Analyze conversion funnel
funnel = journeys.groupby('funnel_stage').size()
```

---

## Schema Reference

All tables include:
- UUID primary keys (database-compatible)
- Timestamp fields (ISO 8601)
- Referential integrity between tables

See `data/json/schemas.json` for complete field definitions.

---

## Use Cases

- **ML Model Training** - Customer journey prediction, conversion modeling
- **Analytics Development** - Dashboard prototyping, KPI testing
- **Database Testing** - Schema validation, query optimization
- **Demo Environments** - Realistic data for presentations

---

## License

MIT License - See LICENSE file

---

## Contributing

Contributions welcome. Please open an issue to discuss changes before submitting PRs.
