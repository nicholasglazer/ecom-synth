#!/usr/bin/env node

/**
 * JKO Data Oracle - Test Suite
 *
 * Run tests to verify data generation and export functionality.
 */

import { DataGenerator } from '../src/generators/index.js';
import { exportCSV, exportJSON, exportSQL } from '../src/exporters/index.js';
import { SCHEMAS } from '../src/schemas/index.js';
import fs from 'fs';
import path from 'path';

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.log(`  ✗ ${message}`);
  }
}

async function runTests() {
  console.log('\n🧪 Running JKO Data Oracle Tests\n');
  console.log('═'.repeat(50));

  // Test 1: Generator initialization
  console.log('\n📦 Test: Generator Initialization');
  console.log('─'.repeat(50));

  const generator = new DataGenerator('small');
  assert(generator !== null, 'Generator instantiates successfully');
  assert(generator.scale.name === 'Small', 'Scale preset loaded correctly');

  // Test 2: Data generation
  console.log('\n📊 Test: Data Generation');
  console.log('─'.repeat(50));

  const data = await generator.generate();

  assert(data.workspaces.length > 0, 'Workspaces generated');
  assert(data.products.length > 0, 'Products generated');
  assert(data.product_variants.length > 0, 'Product variants generated');
  assert(data.social_posts.length > 0, 'Social posts generated');
  assert(data.conversations.length > 0, 'Conversations generated');
  assert(data.orders.length > 0, 'Orders generated');
  assert(data.customer_journeys.length > 0, 'Customer journeys generated');
  assert(data.daily_aggregates.length > 0, 'Daily aggregates generated');

  // Test 3: Data relationships
  console.log('\n🔗 Test: Data Relationships');
  console.log('─'.repeat(50));

  // Check workspace references
  const productWorkspaceIds = new Set(data.products.map(p => p.workspace_id));
  const validWorkspaceIds = new Set(data.workspaces.map(w => w.id));
  const allWorkspacesValid = [...productWorkspaceIds].every(id => validWorkspaceIds.has(id));
  assert(allWorkspacesValid, 'All products reference valid workspaces');

  // Check product references in variants
  const variantProductIds = new Set(data.product_variants.map(v => v.product_id));
  const validProductIds = new Set(data.products.map(p => p.id));
  const allProductsValid = [...variantProductIds].every(id => validProductIds.has(id));
  assert(allProductsValid, 'All variants reference valid products');

  // Test 4: Data integrity
  console.log('\n✅ Test: Data Integrity');
  console.log('─'.repeat(50));

  // Check IDs are UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const allProductsHaveUUID = data.products.every(p => uuidRegex.test(p.id));
  assert(allProductsHaveUUID, 'All product IDs are valid UUIDs');

  // Check prices are positive
  const allPricesPositive = data.products.every(p => p.price_cents > 0);
  assert(allPricesPositive, 'All product prices are positive');

  // Check funnel metrics are logical
  const binding = data.garment_bindings[0];
  if (binding) {
    assert(
      binding.total_dm_conversations <= binding.total_triggers,
      'DM conversations <= triggers (funnel logic)'
    );
    assert(
      binding.total_purchases <= binding.successful_generations,
      'Purchases <= successful generations (funnel logic)'
    );
  }

  // Test 5: Conversion rates
  console.log('\n📈 Test: Conversion Metrics');
  console.log('─'.repeat(50));

  const bindingsWithData = data.garment_bindings.filter(b => b.total_triggers > 0);
  if (bindingsWithData.length > 0) {
    const avgConversionRate = bindingsWithData.reduce((sum, b) => sum + b.overall_conversion_rate, 0) / bindingsWithData.length;
    assert(avgConversionRate >= 0 && avgConversionRate <= 100, `Average conversion rate is realistic: ${avgConversionRate.toFixed(2)}%`);
  }

  // Test 6: Customer journey stages
  console.log('\n🛤️  Test: Customer Journeys');
  console.log('─'.repeat(50));

  const funnelStages = new Set(data.customer_journeys.map(j => j.funnel_stage));
  assert(funnelStages.size >= 3, `Multiple funnel stages present: ${[...funnelStages].join(', ')}`);

  const eventTypes = new Set(data.customer_journeys.map(j => j.event_type));
  assert(eventTypes.size >= 5, `Multiple event types present: ${eventTypes.size} types`);

  // Test 7: Export CSV
  console.log('\n📁 Test: CSV Export');
  console.log('─'.repeat(50));

  await exportCSV(data);
  const csvDir = path.join(process.cwd(), 'data', 'csv');
  const csvFiles = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'));
  assert(csvFiles.length > 0, `CSV files created: ${csvFiles.length} files`);

  // Verify CSV content
  const productsCsv = fs.readFileSync(path.join(csvDir, 'products.csv'), 'utf8');
  assert(productsCsv.includes('id,workspace_id'), 'Products CSV has headers');
  assert(productsCsv.split('\n').length > 2, 'Products CSV has data rows');

  // Test 8: Export JSON
  console.log('\n📁 Test: JSON Export');
  console.log('─'.repeat(50));

  await exportJSON(data);
  const jsonDir = path.join(process.cwd(), 'data', 'json');
  const jsonFiles = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
  assert(jsonFiles.length > 0, `JSON files created: ${jsonFiles.length} files`);

  // Verify JSON content
  const productsJson = JSON.parse(fs.readFileSync(path.join(jsonDir, 'products.json'), 'utf8'));
  assert(Array.isArray(productsJson), 'Products JSON is an array');
  assert(productsJson.length === data.products.length, 'Products JSON has correct record count');

  // Test 9: Export SQL
  console.log('\n📁 Test: SQL Export');
  console.log('─'.repeat(50));

  await exportSQL(data);
  const sqlDir = path.join(process.cwd(), 'data', 'sql');
  const sqlFiles = fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql'));
  assert(sqlFiles.length > 0, `SQL files created: ${sqlFiles.length} files`);

  // Verify SQL content
  const productsSql = fs.readFileSync(path.join(sqlDir, 'products.sql'), 'utf8');
  assert(productsSql.includes('INSERT INTO products'), 'Products SQL has INSERT statements');
  assert(productsSql.includes('VALUES'), 'Products SQL has VALUES');

  // Check schema file
  const schemaSql = fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8');
  assert(schemaSql.includes('CREATE TABLE'), 'Schema SQL has CREATE TABLE statements');
  assert(schemaSql.includes('PRIMARY KEY'), 'Schema SQL has PRIMARY KEY defined');

  // Test 10: Schema definitions
  console.log('\n📋 Test: Schema Definitions');
  console.log('─'.repeat(50));

  assert(Object.keys(SCHEMAS).length >= 10, `Schema definitions exist: ${Object.keys(SCHEMAS).length} tables`);

  // Check database requirements
  const allHavePrimaryKey = Object.values(SCHEMAS).every(s => s.primaryKey);
  assert(allHavePrimaryKey, 'All schemas have PRIMARY KEY defined');

  // Check enhanced tables
  const enhancedTables = Object.entries(SCHEMAS).filter(([_, s]) => s.isEnhancement);
  assert(enhancedTables.length >= 3, `Enhanced tables defined: ${enhancedTables.map(([n]) => n).join(', ')}`);

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('\n📊 Test Results Summary');
  console.log('─'.repeat(50));
  console.log(`  Total tests:  ${testsRun}`);
  console.log(`  Passed:       ${testsPassed} ✓`);
  console.log(`  Failed:       ${testsFailed} ✗`);
  console.log('');

  if (testsFailed === 0) {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed.\n');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});
