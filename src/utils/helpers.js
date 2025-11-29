/**
 * ecom-synth - Utility Helpers
 */

import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../config.js';

/**
 * Generate a UUID
 */
export function generateId() {
  return uuidv4();
}

/**
 * Pick a random item from an array
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Pick a weighted random item
 * @param {Array<{item: any, weight: number}>} weightedItems
 */
export function weightedChoice(weightedItems) {
  const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { item, weight } of weightedItems) {
    random -= weight;
    if (random <= 0) return item;
  }

  return weightedItems[weightedItems.length - 1].item;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random boolean with given probability
 */
export function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Generate a random date between start and end
 */
export function randomDate(start, end) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Generate a date N days ago from now
 */
export function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Format date to ISO string
 */
export function formatDate(date) {
  return date.toISOString();
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateOnly(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Generate a hash-like string (for anonymized customer IDs)
 */
export function generateHash(length = 16) {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Calculate conversion rate with realistic variance
 */
export function calculateConversionRate(baseRate, variance = 0.2) {
  const min = baseRate.min;
  const max = baseRate.max;
  return randomFloat(min, max);
}

/**
 * Generate funnel metrics based on initial triggers and conversion rates
 */
export function generateFunnelMetrics(totalTriggers, rates = CONFIG.funnelRates) {
  const dmConversations = Math.round(totalTriggers * calculateConversionRate(rates.engagementToDM));
  const photoRequests = Math.round(dmConversations * calculateConversionRate(rates.dmToPhotoRequest));
  const photosReceived = Math.round(photoRequests * calculateConversionRate(rates.photoRequestToReceived));
  const tryonsCompleted = Math.round(photosReceived * calculateConversionRate(rates.photoToTryon));
  const linkClicks = Math.round(tryonsCompleted * calculateConversionRate(rates.tryonToLinkClick));
  const purchases = Math.round(linkClicks * calculateConversionRate(rates.linkClickToPurchase));

  return {
    total_triggers: totalTriggers,
    total_dm_conversations: dmConversations,
    total_photo_requests: photoRequests,
    total_photos_received: photosReceived,
    total_generations: photosReceived,  // Same as photos received
    successful_generations: tryonsCompleted,
    total_purchases: purchases,
    trigger_to_dm_rate: totalTriggers > 0 ? Number(((dmConversations / totalTriggers) * 100).toFixed(2)) : 0,
    dm_to_photo_rate: dmConversations > 0 ? Number(((photosReceived / dmConversations) * 100).toFixed(2)) : 0,
    photo_to_success_rate: photosReceived > 0 ? Number(((tryonsCompleted / photosReceived) * 100).toFixed(2)) : 0,
    overall_conversion_rate: totalTriggers > 0 ? Number(((purchases / totalTriggers) * 100).toFixed(2)) : 0
  };
}

/**
 * Generate engagement metrics based on reach
 */
export function generateEngagementMetrics(reach) {
  const impressions = Math.round(reach * randomFloat(1.2, 2.5));  // Impressions >= reach
  const engagementRate = randomFloat(0.01, 0.15);

  const totalEngagement = Math.round(reach * engagementRate);
  const likes = Math.round(totalEngagement * randomFloat(0.6, 0.8));
  const comments = Math.round(totalEngagement * randomFloat(0.05, 0.15));
  const shares = Math.round(totalEngagement * randomFloat(0.02, 0.08));
  const saves = totalEngagement - likes - comments - shares;

  return {
    impressions,
    reach,
    likes: Math.max(0, likes),
    comments: Math.max(0, comments),
    shares: Math.max(0, shares),
    saves: Math.max(0, saves),
    engagement_rate: Number((engagementRate * 100).toFixed(2))
  };
}

/**
 * Get weighted hour based on engagement patterns
 */
export function getWeightedHour() {
  const weights = CONFIG.engagement.hourlyWeights;
  const items = weights.map((weight, hour) => ({ item: hour, weight }));
  return weightedChoice(items);
}

/**
 * Get weighted day of week (0=Sunday to 6=Saturday)
 * Supports both array and object formats
 */
export function getWeightedDayOfWeek() {
  const weights = CONFIG.engagement?.dailyWeights || {
    0: 0.85, 1: 0.95, 2: 1.15, 3: 1.20, 4: 1.15, 5: 1.00, 6: 0.80
  };
  const items = Object.entries(weights).map(([day, weight]) => ({
    item: parseInt(day),
    weight
  }));
  return weightedChoice(items);
}

/**
 * Get weighted country
 */
export function getWeightedCountry() {
  const items = CONFIG.geography.countries.map(c => ({ item: c.code, weight: c.weight }));
  return weightedChoice(items);
}

/**
 * Get weighted device type based on traffic distribution
 */
export function getWeightedDevice() {
  const dist = CONFIG.devices?.distribution || { mobile: 0.70, desktop: 0.28, tablet: 0.02 };
  return weightedChoice([
    { item: 'mobile', weight: dist.mobile },
    { item: 'desktop', weight: dist.desktop },
    { item: 'tablet', weight: dist.tablet }
  ]);
}

/**
 * Get weighted category
 */
export function getWeightedCategory() {
  const items = CONFIG.categories.map(c => ({ item: c, weight: c.weight }));
  return weightedChoice(items);
}

/**
 * Get weighted size based on size curve distribution
 * Uses inventory.sizeDistribution from config
 */
export function getWeightedSize() {
  const sizeDistribution = CONFIG.inventory?.sizeDistribution || {
    'XS': 0.08, 'S': 0.18, 'M': 0.30, 'L': 0.26, 'XL': 0.13, 'XXL': 0.05
  };
  const items = CONFIG.sizes.map(size => ({
    item: size,
    weight: sizeDistribution[size] || 0.15
  }));
  return weightedChoice(items);
}

/**
 * Get weighted customer segment
 */
export function getWeightedCustomerSegment() {
  const items = CONFIG.customerSegments.map(s => ({ item: s, weight: s.probability }));
  return weightedChoice(items);
}

/**
 * Generate a realistic product price
 */
export function generatePrice(category = null) {
  if (category) {
    const cat = CONFIG.categories.find(c => c.name === category);
    if (cat) {
      return Math.round(cat.avgPrice * randomFloat(0.5, 1.5));
    }
  }

  const { min, max, median } = CONFIG.pricing.products;
  // Use a skewed distribution towards median
  const skew = randomFloat(-1, 1);
  const range = skew > 0 ? max - median : median - min;
  return Math.round(median + skew * range * Math.abs(skew));
}

/**
 * Generate SKU
 */
export function generateSKU(category, index) {
  const prefix = category.substring(0, 3).toUpperCase();
  const num = String(index).padStart(4, '0');
  const suffix = randomChoice(['A', 'B', 'C', 'D', 'E']);
  return `${prefix}-${num}-${suffix}`;
}

/**
 * Apply nullable probability
 */
export function maybeNull(value, probability = CONFIG.output.nullProbability) {
  return randomBool(probability) ? null : value;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Round to N decimal places
 */
export function roundTo(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}

export default {
  generateId,
  randomChoice,
  weightedChoice,
  randomInt,
  randomFloat,
  randomBool,
  randomDate,
  daysAgo,
  formatDate,
  formatDateOnly,
  generateHash,
  calculateConversionRate,
  generateFunnelMetrics,
  generateEngagementMetrics,
  getWeightedHour,
  getWeightedDayOfWeek,
  getWeightedCountry,
  getWeightedDevice,
  getWeightedCategory,
  getWeightedSize,
  getWeightedCustomerSegment,
  generatePrice,
  generateSKU,
  maybeNull,
  clamp,
  roundTo
};
