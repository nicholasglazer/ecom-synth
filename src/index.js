#!/usr/bin/env node

/**
 * ecom-synth - Synthetic Data Generator
 *
 * Generates realistic e-commerce conversion funnel data
 * for AI/ML training, analytics development, and testing.
 *
 * Usage:
 *   npm run generate                    # Default (medium scale)
 *   npm run generate:small              # Quick test (~4K records)
 *   npm run generate:large              # Production-like (~300K records)
 *   node src/index.js --scale planning  # Optimized for planning algorithms
 *   node src/index.js --format csv      # Export to CSV only
 *   node src/index.js --format all      # Export to all formats
 */

import minimist from 'minimist';
import { DataGenerator } from './generators/index.js';
import { exportCSV, exportJSON, exportSQL, exportAll } from './exporters/index.js';
import { CONFIG } from './config.js';

// Parse command line arguments
const args = minimist(process.argv.slice(2), {
  string: ['scale', 'format'],
  boolean: ['help', 'list-scales'],
  default: {
    scale: 'medium',
    format: 'all'
  },
  alias: {
    s: 'scale',
    f: 'format',
    h: 'help'
  }
});

// Show help
if (args.help) {
  console.log(`
ecom-synth - Synthetic E-Commerce Data Generator

Usage:
  node src/index.js [options]

Options:
  -s, --scale <name>    Data scale preset (default: medium)
                        Available: small, medium, large, planning

  -f, --format <type>   Export format (default: all)
                        Available: csv, json, sql, all

  --list-scales         List available scale presets

  -h, --help            Show this help message

Examples:
  # Generate medium dataset, export all formats
  node src/index.js

  # Generate small dataset for quick testing
  node src/index.js --scale small

  # Generate planning-optimized dataset
  node src/index.js --scale planning

  # Export only to CSV
  node src/index.js --format csv

  # Large dataset for production testing
  node src/index.js --scale large --format sql

NPM Scripts:
  npm run generate          # Medium scale, all formats
  npm run generate:small    # Small scale
  npm run generate:medium   # Medium scale
  npm run generate:large    # Large scale
  npm run export:csv        # Export CSV only
  npm run export:json       # Export JSON only
  npm run export:sql        # Export SQL only
  npm run test              # Run tests
  npm run clean             # Clean data directory
`);
  process.exit(0);
}

// List available scales
if (args['list-scales']) {
  console.log('\nAvailable Scale Presets:\n');
  for (const [name, config] of Object.entries(CONFIG.scales)) {
    console.log(`  ${name.padEnd(10)} - ${config.description}`);
    console.log(`              Workspaces: ${config.workspaces}, Products: ${config.productsPerWorkspace * config.workspaces}`);
    console.log(`              Days of history: ${config.daysOfHistory}\n`);
  }
  process.exit(0);
}

// Validate scale
const validScales = Object.keys(CONFIG.scales);
if (!validScales.includes(args.scale)) {
  console.error(`Error: Invalid scale "${args.scale}". Available: ${validScales.join(', ')}`);
  process.exit(1);
}

// Validate format
const validFormats = ['csv', 'json', 'sql', 'all'];
if (!validFormats.includes(args.format)) {
  console.error(`Error: Invalid format "${args.format}". Available: ${validFormats.join(', ')}`);
  process.exit(1);
}

// Main execution
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                      ECOM-SYNTH                               ║
║       Synthetic E-Commerce Funnel Data Generator              ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const startTime = Date.now();

  try {
    // Generate data
    const generator = new DataGenerator(args.scale);
    const data = await generator.generate();

    // Export to specified format(s)
    console.log('\n📤 Exporting data...');

    switch (args.format) {
      case 'csv':
        await exportCSV(data);
        break;
      case 'json':
        await exportJSON(data);
        break;
      case 'sql':
        await exportSQL(data);
        break;
      case 'all':
      default:
        await exportAll(data);
        break;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Complete! Generated in ${elapsed}s\n`);

    // Print usage hints
    console.log('📖 Next Steps:');
    console.log('─'.repeat(50));
    console.log('  1. CSV files:  Import into pandas, Excel, etc.');
    console.log('  2. JSON files: Use with APIs or frontend apps');
    console.log('  3. SQL files:  Import into PostgreSQL/HyperCDB');
    console.log('');
    console.log('  For HyperC:');
    console.log('    psql -d your_db -f data/sql/all_data.sql');
    console.log('');
    console.log('  For pandas:');
    console.log('    import pandas as pd');
    console.log('    df = pd.read_csv("data/csv/customer_journeys.csv")');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
