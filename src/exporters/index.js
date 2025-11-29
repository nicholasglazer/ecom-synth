/**
 * ecom-synth - Data Exporters
 *
 * Export generated data in multiple formats:
 * - CSV: For spreadsheet analysis and pandas
 * - JSON: For APIs and frontend consumption
 * - SQL: For direct database import (PostgreSQL/HyperCDB)
 */

import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';
import { SCHEMAS } from '../schemas/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Ensure export directories exist
 */
function ensureDirectories() {
  const dirs = ['csv', 'json', 'sql'];
  for (const dir of dirs) {
    const dirPath = path.join(DATA_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

/**
 * Export to CSV format
 */
export async function exportCSV(data, options = {}) {
  console.log('\n📁 Exporting to CSV...');
  ensureDirectories();

  const outputDir = path.join(DATA_DIR, 'csv');
  const files = [];

  for (const [tableName, records] of Object.entries(data)) {
    if (!records || records.length === 0) continue;

    const filename = `${tableName}.csv`;
    const filepath = path.join(outputDir, filename);

    // Get column headers from first record
    const columns = Object.keys(records[0]);

    // Convert arrays and objects to JSON strings for CSV
    const processedRecords = records.map(record => {
      const processed = {};
      for (const [key, value] of Object.entries(record)) {
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          processed[key] = JSON.stringify(value);
        } else {
          processed[key] = value;
        }
      }
      return processed;
    });

    const csvContent = stringify(processedRecords, {
      header: true,
      columns: columns
    });

    fs.writeFileSync(filepath, csvContent);
    files.push({ table: tableName, file: filename, records: records.length });
    console.log(`  ✓ ${filename} (${records.length.toLocaleString()} records)`);
  }

  console.log(`\n  📂 CSV files saved to: ${outputDir}`);
  return files;
}

/**
 * Export to JSON format
 */
export async function exportJSON(data, options = {}) {
  console.log('\n📁 Exporting to JSON...');
  ensureDirectories();

  const outputDir = path.join(DATA_DIR, 'json');
  const files = [];

  // Export each table as separate file
  for (const [tableName, records] of Object.entries(data)) {
    if (!records || records.length === 0) continue;

    const filename = `${tableName}.json`;
    const filepath = path.join(outputDir, filename);

    const jsonContent = JSON.stringify(records, null, 2);
    fs.writeFileSync(filepath, jsonContent);

    files.push({ table: tableName, file: filename, records: records.length });
    console.log(`  ✓ ${filename} (${records.length.toLocaleString()} records)`);
  }

  // Also export a combined file
  const combinedFilename = 'all_data.json';
  const combinedFilepath = path.join(outputDir, combinedFilename);
  fs.writeFileSync(combinedFilepath, JSON.stringify(data, null, 2));
  console.log(`  ✓ ${combinedFilename} (combined)`);

  // Export schema definitions
  const schemaFilename = 'schemas.json';
  const schemaFilepath = path.join(outputDir, schemaFilename);
  fs.writeFileSync(schemaFilepath, JSON.stringify(SCHEMAS, null, 2));
  console.log(`  ✓ ${schemaFilename} (table definitions)`);

  console.log(`\n  📂 JSON files saved to: ${outputDir}`);
  return files;
}

/**
 * Convert JS value to SQL literal
 */
function toSQLValue(value, type) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (Array.isArray(value)) {
    // PostgreSQL array syntax
    const escaped = value.map(v => `'${String(v).replace(/'/g, "''")}'`);
    return `ARRAY[${escaped.join(', ')}]`;
  }

  if (typeof value === 'object') {
    // JSONB
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  // String - escape single quotes
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Generate CREATE TABLE statement
 */
function generateCreateTable(tableName, schema) {
  if (!schema) {
    // Infer schema from data
    return null;
  }

  const columns = Object.entries(schema.columns).map(([colName, colDef]) => {
    let def = `  ${colName} ${colDef.type.toUpperCase()}`;
    if (colName === schema.primaryKey) {
      def += ' PRIMARY KEY';
    }
    if (colDef.nullable === false) {
      def += ' NOT NULL';
    }
    return def;
  });

  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n${columns.join(',\n')}\n);`;
}

/**
 * Export to SQL format (PostgreSQL compatible)
 */
export async function exportSQL(data, options = {}) {
  console.log('\n📁 Exporting to SQL...');
  ensureDirectories();

  const outputDir = path.join(DATA_DIR, 'sql');
  const files = [];

  // Generate separate files for each table
  for (const [tableName, records] of Object.entries(data)) {
    if (!records || records.length === 0) continue;

    const filename = `${tableName}.sql`;
    const filepath = path.join(outputDir, filename);

    let sqlContent = `-- Generated by ecom-synth
-- Table: ${tableName}
-- Records: ${records.length}
-- Generated at: ${new Date().toISOString()}

`;

    // Add CREATE TABLE if schema available
    const schema = SCHEMAS[tableName];
    if (schema) {
      sqlContent += generateCreateTable(tableName, schema) + '\n\n';
    }

    // Generate INSERT statements
    const columns = Object.keys(records[0]);
    const columnList = columns.join(', ');

    // Use batch inserts for efficiency
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const values = batch.map(record => {
        const vals = columns.map(col => toSQLValue(record[col]));
        return `  (${vals.join(', ')})`;
      });

      sqlContent += `INSERT INTO ${tableName} (${columnList})\nVALUES\n${values.join(',\n')};\n\n`;
    }

    fs.writeFileSync(filepath, sqlContent);
    files.push({ table: tableName, file: filename, records: records.length });
    console.log(`  ✓ ${filename} (${records.length.toLocaleString()} records)`);
  }

  // Generate combined migration file
  const combinedFilename = 'all_data.sql';
  const combinedFilepath = path.join(outputDir, combinedFilename);

  let combinedSQL = `-- ecom-synth - Complete Dataset
-- Generated at: ${new Date().toISOString()}
-- =====================================

BEGIN;

`;

  // Add all tables in dependency order
  const tableOrder = [
    'workspaces', 'accounts', 'products', 'product_variants',
    'inventory_history', 'social_posts', 'post_metrics',
    'garment_bindings', 'conversations', 'orders',
    'customer_journeys', 'daily_aggregates', 'customer_profiles',
    'demand_forecasts'
  ];

  for (const tableName of tableOrder) {
    const records = data[tableName];
    if (!records || records.length === 0) continue;

    combinedSQL += `-- ${tableName} (${records.length} records)\n`;

    const columns = Object.keys(records[0]);
    const columnList = columns.join(', ');

    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = batch.map(record => {
        const vals = columns.map(col => toSQLValue(record[col]));
        return `  (${vals.join(', ')})`;
      });
      combinedSQL += `INSERT INTO ${tableName} (${columnList})\nVALUES\n${values.join(',\n')};\n\n`;
    }
  }

  combinedSQL += 'COMMIT;\n';

  fs.writeFileSync(combinedFilepath, combinedSQL);
  console.log(`  ✓ ${combinedFilename} (combined)`);

  // Generate schema-only file
  const schemaFilename = 'schema.sql';
  const schemaFilepath = path.join(outputDir, schemaFilename);

  let schemaSQL = `-- ecom-synth - Schema Definitions
-- PostgreSQL / HyperCDB Compatible
-- Generated at: ${new Date().toISOString()}
-- =====================================

`;

  for (const [tableName, schema] of Object.entries(SCHEMAS)) {
    const createStatement = generateCreateTable(tableName, schema);
    if (createStatement) {
      schemaSQL += `-- ${schema.description || tableName}\n`;
      if (schema.analyticsUse) {
        schemaSQL += `-- Analytics: ${schema.analyticsUse}\n`;
      }
      schemaSQL += createStatement + '\n\n';
    }
  }

  fs.writeFileSync(schemaFilepath, schemaSQL);
  console.log(`  ✓ ${schemaFilename} (schema only)`);

  console.log(`\n  📂 SQL files saved to: ${outputDir}`);
  return files;
}

/**
 * Export to all formats
 */
export async function exportAll(data, options = {}) {
  const results = {
    csv: await exportCSV(data, options),
    json: await exportJSON(data, options),
    sql: await exportSQL(data, options)
  };
  return results;
}

export default {
  exportCSV,
  exportJSON,
  exportSQL,
  exportAll
};
