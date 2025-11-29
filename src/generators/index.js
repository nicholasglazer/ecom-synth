/**
 * ecom-synth - Main Data Generator
 *
 * Generates interconnected synthetic e-commerce data
 * for AI/ML training, analytics, and testing.
 */

import { faker } from '@faker-js/faker';
import { CONFIG } from '../config.js';
import { SCHEMAS, EVENT_TYPES } from '../schemas/index.js';
import {
  generateId,
  randomChoice,
  randomInt,
  randomFloat,
  randomBool,
  randomDate,
  daysAgo,
  formatDate,
  formatDateOnly,
  generateHash,
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
} from '../utils/helpers.js';

export class DataGenerator {
  constructor(scale = 'medium') {
    this.scale = CONFIG.scales[scale] || CONFIG.scales.medium;
    this.data = {
      workspaces: [],
      accounts: [],
      products: [],
      product_variants: [],
      inventory_history: [],
      social_posts: [],
      post_metrics: [],
      garment_bindings: [],
      conversations: [],
      orders: [],
      customer_journeys: [],
      daily_aggregates: [],
      customer_profiles: [],
      demand_forecasts: []
    };

    // Lookup maps for relationships
    this.lookups = {
      workspaceProducts: new Map(),
      workspacePosts: new Map(),
      productVariants: new Map(),
      postBindings: new Map(),
      customerConversations: new Map()
    };

    console.log(`\n🚀 Initializing generator with scale: ${this.scale.name}`);
    console.log(`   ${this.scale.description}\n`);
  }

  /**
   * Generate all data
   */
  async generate() {
    console.log('📊 Generating synthetic data...\n');

    // Generate in order of dependencies
    await this.generateWorkspaces();
    await this.generateProducts();
    await this.generateProductVariants();
    await this.generateInventoryHistory();
    await this.generateSocialPosts();
    await this.generatePostMetrics();
    await this.generateGarmentBindings();
    await this.generateConversations();
    await this.generateOrders();
    await this.generateCustomerJourneys();
    await this.generateDailyAggregates();
    await this.generateCustomerProfiles();
    await this.generateDemandForecasts();

    console.log('\n✅ Data generation complete!\n');
    this.printSummary();

    return this.data;
  }

  /**
   * Generate workspaces (represents a brand/store)
   */
  async generateWorkspaces() {
    console.log('  → Generating workspaces...');

    for (let i = 0; i < this.scale.workspaces; i++) {
      const workspace = {
        id: generateId(),
        name: faker.company.name(),
        slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
        created_at: formatDate(daysAgo(randomInt(30, 365))),
        updated_at: formatDate(new Date())
      };

      // Also generate a connected account for each workspace
      const account = {
        id: generateId(),
        workspace_id: workspace.id,
        platform: 'instagram',
        platform_account_id: String(randomInt(10000000000, 99999999999)),
        platform_username: `@${faker.internet.userName().toLowerCase()}`,
        status: 'active',
        created_at: workspace.created_at
      };

      this.data.workspaces.push(workspace);
      this.data.accounts.push(account);

      // Initialize lookup maps
      this.lookups.workspaceProducts.set(workspace.id, []);
      this.lookups.workspacePosts.set(workspace.id, []);
    }

    console.log(`     Created ${this.data.workspaces.length} workspaces`);
  }

  /**
   * Generate products
   */
  async generateProducts() {
    console.log('  → Generating products...');

    for (const workspace of this.data.workspaces) {
      const account = this.data.accounts.find(a => a.workspace_id === workspace.id);

      for (let i = 0; i < this.scale.productsPerWorkspace; i++) {
        const category = getWeightedCategory();
        const price = generatePrice(category.name);
        const costCents = Math.round(price * randomFloat(0.3, 0.6));
        const compareAtPrice = randomBool(0.15)
          ? Math.round(price * randomFloat(1.2, 1.5))
          : null;

        const totalInventory = randomInt(
          CONFIG.inventory.initialStock.min,
          CONFIG.inventory.initialStock.max
        );

        const product = {
          id: generateId(),
          workspace_id: workspace.id,
          account_id: account.id,
          shopify_product_id: String(randomInt(1000000000, 9999999999)),
          title: `${faker.commerce.productAdjective()} ${category.name.slice(0, -1)}`,
          description: faker.commerce.productDescription(),
          vendor: faker.company.name(),
          product_type: category.name,
          tags: [
            category.name.toLowerCase(),
            faker.commerce.productMaterial().toLowerCase(),
            randomChoice(['trending', 'new', 'bestseller', 'sale', 'limited'])
          ],
          price_cents: price,
          compare_at_price_cents: compareAtPrice,
          cost_cents: costCents,
          total_inventory: totalInventory,
          has_variants_in_stock: totalInventory > 0,
          lowest_stock_level: randomInt(0, Math.min(10, totalInventory)),
          variants_count: this.scale.variantsPerProduct,
          status: randomBool(0.95) ? 'active' : 'draft',
          created_at: formatDate(randomDate(daysAgo(this.scale.daysOfHistory), new Date())),
          updated_at: formatDate(new Date())
        };

        this.data.products.push(product);
        this.lookups.workspaceProducts.get(workspace.id).push(product);
        this.lookups.productVariants.set(product.id, []);
      }
    }

    console.log(`     Created ${this.data.products.length} products`);
  }

  /**
   * Generate product variants
   */
  async generateProductVariants() {
    console.log('  → Generating product variants...');

    for (const product of this.data.products) {
      const colors = faker.helpers.arrayElements(CONFIG.colors, randomInt(2, 4));

      for (let i = 0; i < this.scale.variantsPerProduct; i++) {
        const size = getWeightedSize();
        const color = randomChoice(colors);
        const inventoryPerVariant = Math.round(product.total_inventory / this.scale.variantsPerProduct);

        const variant = {
          id: generateId(),
          product_id: product.id,
          shopify_variant_id: String(randomInt(10000000000, 99999999999)),
          title: `${size} / ${color}`,
          sku: generateSKU(product.product_type, i),
          size: size,
          color: color,
          price_cents: product.price_cents + randomInt(-500, 500),
          inventory_quantity: clamp(inventoryPerVariant + randomInt(-5, 5), 0, 500),
          available: inventoryPerVariant > 0,
          created_at: product.created_at,
          updated_at: formatDate(new Date())
        };

        this.data.product_variants.push(variant);
        this.lookups.productVariants.get(product.id).push(variant);
      }
    }

    console.log(`     Created ${this.data.product_variants.length} variants`);
  }

  /**
   * Generate inventory history
   */
  async generateInventoryHistory() {
    console.log('  → Generating inventory history...');

    const changeSources = ['sale', 'restock', 'adjustment', 'return'];
    const changeReasons = {
      sale: ['Customer order', 'Wholesale order', 'Flash sale'],
      restock: ['Regular restock', 'Supplier delivery', 'Transfer from warehouse'],
      adjustment: ['Inventory count', 'Damaged goods', 'Quality issue'],
      return: ['Customer return', 'Exchange', 'Defective item']
    };

    for (const variant of this.data.product_variants) {
      // Generate history for each day
      let currentStock = variant.inventory_quantity + randomInt(20, 100);
      const startDate = daysAgo(this.scale.daysOfHistory);

      for (let day = 0; day < this.scale.daysOfHistory; day++) {
        // 0-3 changes per day
        const changesPerDay = randomInt(0, 3);

        for (let c = 0; c < changesPerDay; c++) {
          const source = randomChoice(changeSources);
          let changeAmount;

          switch (source) {
            case 'sale':
              changeAmount = -randomInt(1, 5);
              break;
            case 'restock':
              changeAmount = randomInt(10, 50);
              break;
            case 'adjustment':
              changeAmount = randomInt(-3, 3);
              break;
            case 'return':
              changeAmount = randomInt(1, 2);
              break;
          }

          const previousQuantity = currentStock;
          currentStock = clamp(currentStock + changeAmount, 0, 500);

          if (previousQuantity !== currentStock) {
            const recordDate = new Date(startDate);
            recordDate.setDate(recordDate.getDate() + day);
            recordDate.setHours(randomInt(8, 20), randomInt(0, 59));

            const historyRecord = {
              id: generateId(),
              variant_id: variant.id,
              product_id: variant.product_id,
              previous_quantity: previousQuantity,
              new_quantity: currentStock,
              change_amount: currentStock - previousQuantity,
              change_source: source,
              change_reason: randomChoice(changeReasons[source]),
              recorded_at: formatDate(recordDate)
            };

            this.data.inventory_history.push(historyRecord);
          }
        }
      }
    }

    console.log(`     Created ${this.data.inventory_history.length} inventory records`);
  }

  /**
   * Generate social posts
   */
  async generateSocialPosts() {
    console.log('  → Generating social posts...');

    const mediaTypes = ['IMAGE', 'VIDEO', 'CAROUSEL'];
    const mediaWeights = [0.6, 0.25, 0.15];

    for (const workspace of this.data.workspaces) {
      const account = this.data.accounts.find(a => a.workspace_id === workspace.id);
      const products = this.lookups.workspaceProducts.get(workspace.id);

      for (let i = 0; i < this.scale.postsPerWorkspace; i++) {
        const postedAt = randomDate(daysAgo(this.scale.daysOfHistory), new Date());
        const linkedProduct = randomBool(0.7) ? randomChoice(products) : null;

        const post = {
          id: generateId(),
          workspace_id: workspace.id,
          account_id: account.id,
          platform_post_id: `${randomInt(10000000, 99999999)}${randomInt(10000000, 99999999)}`,
          media_type: randomChoice(mediaTypes),
          caption: faker.lorem.paragraph() + ' ' + faker.helpers.arrayElements(
            ['#fashion', '#style', '#ootd', '#shopping', '#tryon', '#newcollection'],
            randomInt(3, 6)
          ).join(' '),
          permalink: `https://www.instagram.com/p/${faker.string.alphanumeric(11)}/`,
          product_id: linkedProduct?.id || null,
          posted_at: formatDate(postedAt),
          created_at: formatDate(postedAt)
        };

        this.data.social_posts.push(post);
        this.lookups.workspacePosts.get(workspace.id).push(post);
      }
    }

    console.log(`     Created ${this.data.social_posts.length} posts`);
  }

  /**
   * Generate post metrics
   */
  async generatePostMetrics() {
    console.log('  → Generating post metrics...');

    for (const post of this.data.social_posts) {
      const postDate = new Date(post.posted_at);
      const daysSincePost = Math.floor((Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24));
      const metricsToGenerate = Math.min(daysSincePost, 30);  // Max 30 days of metrics

      for (let day = 0; day < metricsToGenerate; day++) {
        const metricDate = new Date(postDate);
        metricDate.setDate(metricDate.getDate() + day);

        // Engagement decays over time
        const decayFactor = Math.exp(-day * 0.1);
        const baseReach = randomInt(100, 10000) * decayFactor;
        const metrics = generateEngagementMetrics(Math.round(baseReach));

        const postMetric = {
          id: generateId(),
          post_id: post.id,
          account_id: post.account_id,
          metric_date: formatDateOnly(metricDate),
          metric_hour: getWeightedHour(),
          ...metrics,
          created_at: formatDate(metricDate)
        };

        this.data.post_metrics.push(postMetric);
      }
    }

    console.log(`     Created ${this.data.post_metrics.length} metric records`);
  }

  /**
   * Generate garment bindings (post-to-product links with conversion funnels)
   */
  async generateGarmentBindings() {
    console.log('  → Generating garment bindings...');

    for (const post of this.data.social_posts) {
      if (!post.product_id) continue;  // Skip posts without products

      const product = this.data.products.find(p => p.id === post.product_id);
      if (!product) continue;

      // Calculate total triggers based on post engagement
      const postMetrics = this.data.post_metrics.filter(m => m.post_id === post.id);
      const totalImpressions = postMetrics.reduce((sum, m) => sum + m.impressions, 0);
      const totalTriggers = Math.round(totalImpressions * randomFloat(0.001, 0.01));

      const funnelMetrics = generateFunnelMetrics(totalTriggers);

      const binding = {
        id: generateId(),
        post_id: post.id,
        product_id: product.id,
        workspace_id: post.workspace_id,
        account_id: post.account_id,
        garment_name: product.title,
        is_active: true,
        ...funnelMetrics,
        total_revenue_cents: funnelMetrics.total_purchases * product.price_cents,
        avg_response_time_ms: randomInt(500, 3000),
        avg_generation_time_ms: randomInt(10000, 25000),
        last_used_at: funnelMetrics.total_triggers > 0 ? formatDate(randomDate(daysAgo(7), new Date())) : null,
        created_at: post.created_at,
        updated_at: formatDate(new Date())
      };

      this.data.garment_bindings.push(binding);
      this.lookups.postBindings.set(post.id, binding);
    }

    console.log(`     Created ${this.data.garment_bindings.length} bindings`);
  }

  /**
   * Generate conversations
   */
  async generateConversations() {
    console.log('  → Generating conversations...');

    const states = CONFIG.conversationStates;

    for (const workspace of this.data.workspaces) {
      const account = this.data.accounts.find(a => a.workspace_id === workspace.id);
      const bindings = this.data.garment_bindings.filter(b => b.workspace_id === workspace.id);

      for (let i = 0; i < this.scale.conversationsPerWorkspace; i++) {
        const customerId = generateHash(16);
        const startedAt = randomDate(daysAgo(this.scale.daysOfHistory), new Date());
        const messageCount = randomInt(2, 15);
        const state = randomChoice(states);

        // Determine if conversation resulted in tryon/purchase
        const resultedInTryon = ['processing_tryon', 'result_sent', 'completed'].includes(state);
        const resultedInPurchase = resultedInTryon && randomBool(0.15);
        const binding = bindings.length > 0 ? randomChoice(bindings) : null;

        const conversation = {
          id: generateId(),
          workspace_id: workspace.id,
          account_id: account.id,
          participant_id: customerId,
          conversation_state: state,
          category: resultedInTryon ? 'tryon' : 'general',
          started_at: formatDate(startedAt),
          last_message_at: formatDate(randomDate(startedAt, new Date())),
          message_count: messageCount,
          bot_messages: Math.round(messageCount * 0.4),
          user_messages: Math.round(messageCount * 0.6),
          resulted_in_tryon: resultedInTryon,
          resulted_in_purchase: resultedInPurchase,
          purchase_amount_cents: resultedInPurchase && binding
            ? this.data.products.find(p => p.id === binding.product_id)?.price_cents || 5000
            : null,
          created_at: formatDate(startedAt)
        };

        this.data.conversations.push(conversation);

        // Track customer conversations
        if (!this.lookups.customerConversations.has(customerId)) {
          this.lookups.customerConversations.set(customerId, []);
        }
        this.lookups.customerConversations.get(customerId).push(conversation);
      }
    }

    console.log(`     Created ${this.data.conversations.length} conversations`);
  }

  /**
   * Generate orders
   */
  async generateOrders() {
    console.log('  → Generating orders...');

    for (const workspace of this.data.workspaces) {
      const account = this.data.accounts.find(a => a.workspace_id === workspace.id);
      const products = this.lookups.workspaceProducts.get(workspace.id);
      const conversations = this.data.conversations.filter(c =>
        c.workspace_id === workspace.id && c.resulted_in_purchase
      );

      for (let i = 0; i < this.scale.ordersPerWorkspace; i++) {
        const product = randomChoice(products);
        const itemCount = randomInt(1, 4);
        const subtotal = product.price_cents * itemCount;
        const tax = Math.round(subtotal * 0.08);
        const shipping = randomBool(0.7) ? 0 : randomInt(500, 1500);
        const discount = randomBool(0.2) ? Math.round(subtotal * randomFloat(0.1, 0.3)) : 0;

        // Link to a conversation if available
        const conversation = i < conversations.length ? conversations[i] : null;
        const binding = conversation
          ? this.data.garment_bindings.find(b => b.workspace_id === workspace.id)
          : null;

        const orderedAt = randomDate(daysAgo(this.scale.daysOfHistory), new Date());

        const order = {
          id: generateId(),
          workspace_id: workspace.id,
          account_id: account.id,
          shopify_order_id: String(randomInt(1000000, 9999999)),
          order_number: 1000 + i,
          customer_id: conversation?.participant_id || generateHash(16),
          total_price_cents: subtotal + tax + shipping - discount,
          subtotal_cents: subtotal,
          tax_cents: tax,
          shipping_cents: shipping,
          discount_cents: discount,
          line_items_count: itemCount,
          financial_status: randomChoice(['paid', 'paid', 'paid', 'pending', 'refunded']),
          fulfillment_status: randomChoice(['fulfilled', 'fulfilled', 'partial', null]),
          attributed_to_tryon: !!conversation,
          attribution_confidence: conversation ? randomChoice(['high', 'medium', 'low']) : null,
          conversation_id: conversation?.id || null,
          binding_id: binding?.id || null,
          ordered_at: formatDate(orderedAt),
          created_at: formatDate(orderedAt)
        };

        this.data.orders.push(order);
      }
    }

    console.log(`     Created ${this.data.orders.length} orders`);
  }

  /**
   * Generate customer journeys (event stream)
   *
   * Research-backed conversion funnel:
   * - Instagram fashion engagement: 0.68-0.99% (Source: Rival IQ)
   * - DM to sale: 3-7% for brands (Source: Napolify)
   * - Virtual try-on boost: +44% add-to-cart (Source: Grand View Research)
   * - Cart abandonment: 77.1% (Source: Dynamic Yield)
   */
  async generateCustomerJourneys() {
    console.log('  → Generating customer journeys...');

    // Event sequences from view to purchase
    const eventSequences = [
      // Awareness only - vast majority just scroll
      [EVENT_TYPES.POST_VIEW],
      // Engagement - like only
      [EVENT_TYPES.POST_VIEW, EVENT_TYPES.POST_LIKE],
      // Engagement - comment
      [EVENT_TYPES.POST_VIEW, EVENT_TYPES.POST_COMMENT],
      // Interest - DM started
      [EVENT_TYPES.POST_VIEW, EVENT_TYPES.POST_LIKE, EVENT_TYPES.DM_STARTED],
      // Interest - trigger keyword
      [EVENT_TYPES.POST_VIEW, EVENT_TYPES.POST_COMMENT, EVENT_TYPES.TRIGGER_KEYWORD, EVENT_TYPES.DM_STARTED],
      // Consideration - photo requested but not sent
      [EVENT_TYPES.POST_VIEW, EVENT_TYPES.DM_STARTED, EVENT_TYPES.PHOTO_REQUESTED],
      // Consideration - photo received, try-on done
      [EVENT_TYPES.POST_VIEW, EVENT_TYPES.DM_STARTED, EVENT_TYPES.PHOTO_REQUESTED, EVENT_TYPES.PHOTO_RECEIVED, EVENT_TYPES.TRYON_COMPLETED],
      // Intent - clicked link but abandoned
      [EVENT_TYPES.POST_VIEW, EVENT_TYPES.DM_STARTED, EVENT_TYPES.PHOTO_RECEIVED, EVENT_TYPES.TRYON_COMPLETED, EVENT_TYPES.PRODUCT_LINK_CLICKED],
      // Full conversion - purchase completed
      [EVENT_TYPES.POST_VIEW, EVENT_TYPES.DM_STARTED, EVENT_TYPES.PHOTO_RECEIVED, EVENT_TYPES.TRYON_COMPLETED, EVENT_TYPES.PRODUCT_LINK_CLICKED, EVENT_TYPES.PURCHASE_COMPLETED]
    ];

    // Research-backed probabilities:
    // - 0.68-0.99% engagement rate for fashion (Source: Rival IQ)
    // - ~5% of engaged users start DM
    // - ~45% of DM users send photo
    // - ~90% of photos result in successful try-on
    // - ~30% click product link
    // - ~23% of link clicks complete purchase (after 77% cart abandonment)
    const eventProbabilities = [
      0.9800,  // 98.0% - View only (scroll past)
      0.0080,  // 0.8% - Like only (engagement rate ~0.8%)
      0.0040,  // 0.4% - Comment only
      0.0030,  // 0.3% - Like + DM
      0.0015,  // 0.15% - Comment + Trigger + DM
      0.0012,  // 0.12% - Photo requested but dropped
      0.0010,  // 0.10% - Try-on completed
      0.0008,  // 0.08% - Link clicked (abandoned cart)
      0.0005   // 0.05% - Purchase completed (~3% of DMs convert)
    ];

    for (const workspace of this.data.workspaces) {
      const posts = this.lookups.workspacePosts.get(workspace.id);
      const products = this.lookups.workspaceProducts.get(workspace.id);

      // Assign performance tier to each post (some viral, some flop)
      const postPerformance = new Map();
      for (const post of posts) {
        const tier = this.getPerformanceTier(CONFIG.postPerformance.distribution);
        postPerformance.set(post.id, tier);
      }

      for (let i = 0; i < this.scale.customersPerWorkspace; i++) {
        const sessionId = generateId();
        const customerId = generateHash(16);
        const device = this.getWeightedDeviceWithConversion();
        const country = getWeightedCountry();

        // Session timestamp with seasonal and time-of-day patterns
        const sessionStart = this.getSeasonallyWeightedDate(this.scale.daysOfHistory);
        let eventTime = new Date(sessionStart);

        // Get monthly multiplier for this date
        const month = sessionStart.getMonth() + 1;
        const seasonalMult = CONFIG.seasonality.monthly[month] || 1.0;

        // Get day-of-week multiplier
        const dayOfWeek = sessionStart.getDay();
        const dayMult = CONFIG.engagement.dailyWeights[dayOfWeek] || 1.0;

        // Combined multiplier affects conversion probability
        const temporalMult = seasonalMult * dayMult;

        // Select a post (weighted by performance)
        const post = this.selectWeightedPost(posts, postPerformance);
        const postMult = postPerformance.get(post.id)?.multiplier || 1.0;

        const product = randomChoice(products);
        const conversation = this.data.conversations.find(c =>
          c.participant_id === customerId && c.workspace_id === workspace.id
        );

        // Device affects conversion
        const deviceMult = CONFIG.devices.conversionMultiplier[device] || 1.0;

        // Combined multiplier - boosts probability of deeper funnel
        const totalMult = temporalMult * postMult * deviceMult;

        // Adjust probabilities based on multipliers
        const adjustedProbs = this.adjustProbabilities(eventProbabilities, totalMult);

        // Pick an event sequence using weighted random
        let sequenceIndex = 0;
        const rand = Math.random();
        let cumulative = 0;
        for (let idx = 0; idx < adjustedProbs.length; idx++) {
          cumulative += adjustedProbs[idx];
          if (rand < cumulative) {
            sequenceIndex = idx;
            break;
          }
        }
        const sequence = eventSequences[sequenceIndex];

        for (let eventIndex = 0; eventIndex < sequence.length; eventIndex++) {
          const eventType = sequence[eventIndex];
          const funnelStage = this.getEventFunnelStage(eventType);

          const journey = {
            id: generateId(),
            session_id: sessionId,
            customer_id: customerId,
            workspace_id: workspace.id,
            event_type: eventType,
            event_timestamp: formatDate(eventTime),
            source_platform: 'instagram',
            device_type: device,
            geo_country: country,
            geo_region: maybeNull(faker.location.state()),
            post_id: post?.id || null,
            product_id: product?.id || null,
            conversation_id: conversation?.id || null,
            funnel_stage: funnelStage,
            converted_to_next_stage: eventIndex < sequence.length - 1,
            time_to_next_event_seconds: randomInt(5, 300),
            session_event_number: eventIndex + 1,
            is_session_first_event: eventIndex === 0,
            is_session_last_event: eventIndex === sequence.length - 1
          };

          this.data.customer_journeys.push(journey);

          // Advance time for next event (variable based on stage)
          const timeToNext = this.getTimeToNextEvent(eventType);
          eventTime = new Date(eventTime.getTime() + timeToNext);
        }
      }
    }

    console.log(`     Created ${this.data.customer_journeys.length} journey events`);
  }

  /**
   * Get performance tier for posts/products
   * Creates realistic variance where some items perform much better
   */
  getPerformanceTier(distribution) {
    const rand = Math.random();
    let cumulative = 0;

    for (const [tier, config] of Object.entries(distribution)) {
      cumulative += config.probability;
      if (rand < cumulative) {
        const multiplier = randomFloat(config.multiplier.min, config.multiplier.max);
        return { tier, multiplier };
      }
    }
    return { tier: 'average', multiplier: 1.0 };
  }

  /**
   * Get device with conversion weighting
   * Mobile 70%, Desktop 28%, Tablet 2%
   */
  getWeightedDeviceWithConversion() {
    const rand = Math.random();
    const dist = CONFIG.devices.distribution;

    if (rand < dist.mobile) return 'mobile';
    if (rand < dist.mobile + dist.desktop) return 'desktop';
    return 'tablet';
  }

  /**
   * Get a date weighted by seasonal patterns
   * More events in peak months (November), fewer in slow months (February)
   */
  getSeasonallyWeightedDate(daysOfHistory) {
    const now = new Date();
    const startDate = daysAgo(daysOfHistory);

    // Try up to 10 times to get a date, weighted by seasonal probability
    for (let attempt = 0; attempt < 10; attempt++) {
      const randomDay = randomInt(0, daysOfHistory);
      const candidateDate = new Date(startDate);
      candidateDate.setDate(candidateDate.getDate() + randomDay);

      const month = candidateDate.getMonth() + 1;
      const seasonalWeight = CONFIG.seasonality.monthly[month] || 1.0;

      // Accept based on seasonal weight (higher months more likely)
      if (Math.random() < seasonalWeight) {
        // Add time-of-day weighting
        const hour = this.getWeightedHourOfDay();
        candidateDate.setHours(hour, randomInt(0, 59), randomInt(0, 59));
        return candidateDate;
      }
    }

    // Fallback to random date
    const randomDay = randomInt(0, daysOfHistory);
    const fallbackDate = new Date(startDate);
    fallbackDate.setDate(fallbackDate.getDate() + randomDay);
    const hour = this.getWeightedHourOfDay();
    fallbackDate.setHours(hour, randomInt(0, 59), randomInt(0, 59));
    return fallbackDate;
  }

  /**
   * Get hour weighted by engagement patterns
   * Peaks at 7-9 AM, 11 AM-1 PM, 5-9 PM
   */
  getWeightedHourOfDay() {
    const weights = CONFIG.engagement.hourlyWeights;
    const rand = Math.random();
    let cumulative = 0;

    for (let hour = 0; hour < 24; hour++) {
      cumulative += weights[hour];
      if (rand < cumulative) return hour;
    }
    return 12;  // Fallback to noon
  }

  /**
   * Select a post weighted by its performance tier
   * Viral posts get more views
   */
  selectWeightedPost(posts, performanceMap) {
    // Calculate total weight
    let totalWeight = 0;
    for (const post of posts) {
      const perf = performanceMap.get(post.id);
      totalWeight += perf?.multiplier || 1.0;
    }

    // Select weighted
    let rand = Math.random() * totalWeight;
    for (const post of posts) {
      const perf = performanceMap.get(post.id);
      rand -= perf?.multiplier || 1.0;
      if (rand <= 0) return post;
    }
    return posts[0];
  }

  /**
   * Adjust funnel probabilities based on multiplier
   * Higher multiplier = more likely to progress deeper in funnel
   */
  adjustProbabilities(baseProbs, multiplier) {
    // Clamp multiplier to reasonable range
    const mult = clamp(multiplier, 0.3, 3.0);

    // Start with base probabilities
    const adjusted = [...baseProbs];

    // For multiplier > 1, shift probability from view-only to deeper funnel
    // For multiplier < 1, shift probability from deep funnel to view-only
    if (mult > 1) {
      const boost = (mult - 1) * 0.01;  // Small boost to conversion stages
      adjusted[0] -= boost;  // Less view-only
      // Distribute boost to conversion stages
      for (let i = 1; i < adjusted.length; i++) {
        adjusted[i] += boost / (adjusted.length - 1);
      }
    } else {
      const reduction = (1 - mult) * 0.01;
      adjusted[0] += reduction;  // More view-only
      for (let i = 1; i < adjusted.length; i++) {
        adjusted[i] = Math.max(0, adjusted[i] - reduction / (adjusted.length - 1));
      }
    }

    // Normalize to sum to 1
    const sum = adjusted.reduce((a, b) => a + b, 0);
    return adjusted.map(p => p / sum);
  }

  /**
   * Get realistic time between events based on event type
   */
  getTimeToNextEvent(eventType) {
    const timeRanges = {
      [EVENT_TYPES.POST_VIEW]: [2000, 10000],        // 2-10 seconds to like
      [EVENT_TYPES.POST_LIKE]: [5000, 30000],        // 5-30 sec to comment/DM
      [EVENT_TYPES.POST_COMMENT]: [10000, 60000],    // 10-60 sec
      [EVENT_TYPES.DM_STARTED]: [60000, 300000],     // 1-5 min to photo request
      [EVENT_TYPES.TRIGGER_KEYWORD]: [30000, 120000],
      [EVENT_TYPES.PHOTO_REQUESTED]: [60000, 1800000],  // 1-30 min to send photo
      [EVENT_TYPES.PHOTO_RECEIVED]: [5000, 30000],   // 5-30 sec to process
      [EVENT_TYPES.TRYON_COMPLETED]: [10000, 60000], // 10-60 sec to click link
      [EVENT_TYPES.PRODUCT_LINK_CLICKED]: [30000, 300000], // 30 sec - 5 min to purchase
    };

    const range = timeRanges[eventType] || [5000, 60000];
    return randomInt(range[0], range[1]);
  }

  /**
   * Get funnel stage for an event type
   */
  getEventFunnelStage(eventType) {
    const stageMap = {
      [EVENT_TYPES.POST_VIEW]: 1,
      [EVENT_TYPES.POST_LIKE]: 1,
      [EVENT_TYPES.POST_COMMENT]: 1,
      [EVENT_TYPES.POST_SAVE]: 1,
      [EVENT_TYPES.POST_SHARE]: 1,
      [EVENT_TYPES.DM_STARTED]: 2,
      [EVENT_TYPES.TRIGGER_KEYWORD]: 2,
      [EVENT_TYPES.BOT_GREETING]: 2,
      [EVENT_TYPES.PHOTO_REQUESTED]: 3,
      [EVENT_TYPES.PHOTO_RECEIVED]: 3,
      [EVENT_TYPES.TRYON_STARTED]: 3,
      [EVENT_TYPES.TRYON_COMPLETED]: 3,
      [EVENT_TYPES.TRYON_FAILED]: 3,
      [EVENT_TYPES.PRODUCT_LINK_CLICKED]: 4,
      [EVENT_TYPES.ADD_TO_CART]: 4,
      [EVENT_TYPES.CHECKOUT_STARTED]: 4,
      [EVENT_TYPES.PURCHASE_COMPLETED]: 4,
      [EVENT_TYPES.REVIEW_SUBMITTED]: 5,
      [EVENT_TYPES.RETURN_INITIATED]: 5,
      [EVENT_TYPES.REPEAT_VISIT]: 5
    };
    return stageMap[eventType] || 1;
  }

  /**
   * Generate daily aggregates
   */
  async generateDailyAggregates() {
    console.log('  → Generating daily aggregates...');

    for (const workspace of this.data.workspaces) {
      const products = this.lookups.workspaceProducts.get(workspace.id);

      for (let day = 0; day < this.scale.daysOfHistory; day++) {
        const metricDate = daysAgo(this.scale.daysOfHistory - day);
        const dayOfWeek = metricDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Apply realistic temporal patterns
        // Weekend: 40-60% higher engagement, 30-50% higher purchases
        // Weekday: baseline
        // Monday: slightly lower (post-weekend)
        // Friday: slightly higher (pre-weekend excitement)
        const weekendMult = isWeekend ? randomFloat(1.4, 1.6) : 1.0;
        const dayMult = dayOfWeek === 1 ? 0.85 : (dayOfWeek === 5 ? 1.15 : 1.0);
        const totalMult = weekendMult * dayMult;

        const baseImpressions = randomInt(10000, 30000);
        const baseEngagements = Math.round(baseImpressions * randomFloat(0.02, 0.05));
        const baseDMs = Math.round(baseEngagements * randomFloat(0.02, 0.08));
        const baseTryons = Math.round(baseDMs * randomFloat(0.3, 0.5));
        const baseOrders = Math.round(baseTryons * randomFloat(0.1, 0.25));
        const baseRevenue = baseOrders * randomInt(3000, 12000);

        // Workspace-level aggregate
        const wsAggregate = {
          id: generateId(),
          workspace_id: workspace.id,
          product_id: null,
          metric_date: formatDateOnly(metricDate),
          impressions: Math.round(baseImpressions * totalMult),
          post_engagements: Math.round(baseEngagements * totalMult),
          dm_conversations_started: Math.round(baseDMs * totalMult),
          tryons_completed: Math.round(baseTryons * totalMult),
          orders_placed: Math.round(baseOrders * totalMult * randomFloat(1.2, 1.5)),  // Purchases spike more on weekends
          revenue_cents: Math.round(baseRevenue * totalMult * randomFloat(1.2, 1.5)),
          attributed_revenue_cents: Math.round(baseRevenue * totalMult * randomFloat(0.4, 0.7)),
          impression_to_dm_rate: roundTo(baseDMs / Math.max(baseImpressions, 1), 4),
          dm_to_tryon_rate: roundTo(baseTryons / Math.max(baseDMs, 1), 4),
          tryon_to_purchase_rate: roundTo(baseOrders / Math.max(baseTryons, 1), 4),
          overall_conversion_rate: roundTo(baseOrders / Math.max(baseImpressions, 1), 4),
          inventory_start: randomInt(500, 5000),
          inventory_end: randomInt(500, 5000),
          units_sold: Math.round(baseOrders * randomFloat(1.0, 1.5)),
          day_of_week: dayOfWeek,
          is_weekend: isWeekend,
          is_holiday: randomBool(0.03),
          weather_condition: randomChoice(CONFIG.weatherConditions)
        };

        this.data.daily_aggregates.push(wsAggregate);

        // Product-level aggregates (sample 10% of products)
        for (const product of products.filter(() => randomBool(0.1))) {
          // Product-specific variance (some products perform 2-3x better)
          const productPerformance = randomFloat(0.3, 2.5);
          const pBaseImpressions = randomInt(500, 3000);
          const pBaseEngagements = Math.round(pBaseImpressions * randomFloat(0.02, 0.06) * productPerformance);
          const pBaseDMs = Math.round(pBaseEngagements * randomFloat(0.02, 0.1));
          const pBaseTryons = Math.round(pBaseDMs * randomFloat(0.25, 0.55));
          const pBaseOrders = Math.round(pBaseTryons * randomFloat(0.08, 0.3));

          const prodAggregate = {
            id: generateId(),
            workspace_id: workspace.id,
            product_id: product.id,
            metric_date: formatDateOnly(metricDate),
            impressions: Math.round(pBaseImpressions * totalMult),
            post_engagements: Math.round(pBaseEngagements * totalMult),
            dm_conversations_started: Math.round(pBaseDMs * totalMult),
            tryons_completed: Math.round(pBaseTryons * totalMult),
            orders_placed: Math.round(pBaseOrders * totalMult),
            revenue_cents: Math.round(pBaseOrders * product.price_cents * totalMult),
            attributed_revenue_cents: Math.round(pBaseOrders * product.price_cents * randomFloat(0.3, 0.7) * totalMult),
            impression_to_dm_rate: roundTo(pBaseDMs / Math.max(pBaseImpressions, 1), 4),
            dm_to_tryon_rate: roundTo(pBaseTryons / Math.max(pBaseDMs, 1), 4),
            tryon_to_purchase_rate: roundTo(pBaseOrders / Math.max(pBaseTryons, 1), 4),
            overall_conversion_rate: roundTo(pBaseOrders / Math.max(pBaseImpressions, 1), 4),
            inventory_start: randomInt(10, 100),
            inventory_end: randomInt(10, 100),
            units_sold: pBaseOrders,
            day_of_week: dayOfWeek,
            is_weekend: isWeekend,
            is_holiday: randomBool(0.03),
            weather_condition: randomChoice(CONFIG.weatherConditions)
          };

          this.data.daily_aggregates.push(prodAggregate);
        }
      }
    }

    console.log(`     Created ${this.data.daily_aggregates.length} daily aggregates`);
  }

  /**
   * Generate customer profiles
   */
  async generateCustomerProfiles() {
    console.log('  → Generating customer profiles...');

    // Group conversations by customer
    for (const [customerId, conversations] of this.lookups.customerConversations) {
      const workspace = this.data.workspaces.find(w =>
        w.id === conversations[0].workspace_id
      );

      const totalPurchases = conversations.filter(c => c.resulted_in_purchase).length;
      const totalRevenue = conversations.reduce((sum, c) =>
        sum + (c.purchase_amount_cents || 0), 0
      );
      const totalTryons = conversations.filter(c => c.resulted_in_tryon).length;

      // Parse last seen date
      const lastSeenStr = conversations[conversations.length - 1].last_message_at;
      const lastSeen = new Date(lastSeenStr);
      const daysSinceLastSeen = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));

      // DERIVE segment from actual behavior (not random!)
      let segment, churnProb, nextPurchaseProb, predictedLtv;

      if (totalPurchases >= 3 || totalRevenue > 30000) {
        // High value: 3+ purchases OR $300+ revenue
        segment = 'high_value';
        churnProb = randomFloat(0.05, 0.15);
        nextPurchaseProb = randomFloat(0.4, 0.7);
        predictedLtv = Math.round(totalRevenue * randomFloat(2, 5));
      } else if (totalPurchases >= 1) {
        // Regular: 1-2 purchases
        segment = 'regular';
        churnProb = randomFloat(0.15, 0.35);
        nextPurchaseProb = randomFloat(0.2, 0.4);
        predictedLtv = Math.round(totalRevenue * randomFloat(1.5, 3));
      } else if (daysSinceLastSeen > 60) {
        // Churned: no activity in 60+ days
        segment = 'churned';
        churnProb = randomFloat(0.85, 0.98);
        nextPurchaseProb = randomFloat(0.01, 0.05);
        predictedLtv = 0;
      } else if (daysSinceLastSeen > 30) {
        // At risk: no activity in 30-60 days
        segment = 'at_risk';
        churnProb = randomFloat(0.5, 0.8);
        nextPurchaseProb = randomFloat(0.05, 0.15);
        predictedLtv = randomInt(2000, 8000);
      } else if (totalTryons > 0) {
        // Casual: engaged (tried on) but no purchase yet
        segment = 'casual';
        churnProb = randomFloat(0.3, 0.5);
        nextPurchaseProb = randomFloat(0.1, 0.25);
        predictedLtv = randomInt(5000, 15000);
      } else {
        // New/browsing: just conversations, no deep engagement
        segment = 'casual';
        churnProb = randomFloat(0.4, 0.6);
        nextPurchaseProb = randomFloat(0.05, 0.1);
        predictedLtv = randomInt(1000, 5000);
      }

      const profile = {
        id: generateId(),
        customer_id: customerId,
        workspace_id: workspace.id,
        first_seen_at: conversations[0].started_at,
        last_seen_at: lastSeenStr,
        total_sessions: conversations.length,
        total_dm_conversations: conversations.length,
        total_tryons: totalTryons,
        total_purchases: totalPurchases,
        total_revenue_cents: totalRevenue,
        avg_order_value_cents: totalPurchases > 0 ? Math.round(totalRevenue / totalPurchases) : 0,
        preferred_device: getWeightedDevice(),
        preferred_time_of_day: randomChoice(['morning', 'afternoon', 'evening', 'night']),
        preferred_day_of_week: getWeightedDayOfWeek(),
        predicted_ltv_cents: predictedLtv,
        churn_probability: roundTo(churnProb, 4),
        next_purchase_probability: roundTo(nextPurchaseProb, 4),
        customer_segment: segment,
        created_at: formatDate(new Date()),
        updated_at: formatDate(new Date())
      };

      this.data.customer_profiles.push(profile);
    }

    console.log(`     Created ${this.data.customer_profiles.length} customer profiles`);
  }

  /**
   * Generate demand forecasts (HyperC output simulation)
   */
  async generateDemandForecasts() {
    console.log('  → Generating demand forecasts...');

    const horizons = [7, 14, 30];  // Days ahead

    for (const product of this.data.products.slice(0, 50)) {  // Sample 50 products
      for (const horizon of horizons) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + horizon);

        const predictedDemand = randomInt(5, 50);
        const variance = randomFloat(0.1, 0.3);

        const forecast = {
          id: generateId(),
          product_id: product.id,
          variant_id: null,
          workspace_id: product.workspace_id,
          forecast_date: formatDateOnly(forecastDate),
          forecast_horizon_days: horizon,
          predicted_demand: predictedDemand,
          confidence_interval_low: Math.round(predictedDemand * (1 - variance)),
          confidence_interval_high: Math.round(predictedDemand * (1 + variance)),
          prediction_confidence: roundTo(randomFloat(0.7, 0.95), 4),
          actual_demand: null,  // To be filled in when actual data available
          forecast_error: null,
          model_version: 'forecast-model-v1',
          features_used: ['inventory_history', 'engagement_metrics', 'seasonality', 'price'],
          generated_at: formatDate(new Date())
        };

        this.data.demand_forecasts.push(forecast);
      }
    }

    console.log(`     Created ${this.data.demand_forecasts.length} demand forecasts`);
  }

  /**
   * Print summary of generated data
   */
  printSummary() {
    console.log('📋 Data Summary:');
    console.log('─'.repeat(50));

    const tables = [
      ['workspaces', this.data.workspaces.length],
      ['accounts', this.data.accounts.length],
      ['products', this.data.products.length],
      ['product_variants', this.data.product_variants.length],
      ['inventory_history', this.data.inventory_history.length],
      ['social_posts', this.data.social_posts.length],
      ['post_metrics', this.data.post_metrics.length],
      ['garment_bindings', this.data.garment_bindings.length],
      ['conversations', this.data.conversations.length],
      ['orders', this.data.orders.length],
      ['customer_journeys', this.data.customer_journeys.length],
      ['daily_aggregates', this.data.daily_aggregates.length],
      ['customer_profiles', this.data.customer_profiles.length],
      ['demand_forecasts', this.data.demand_forecasts.length]
    ];

    let totalRecords = 0;
    for (const [table, count] of tables) {
      console.log(`  ${table.padEnd(25)} ${count.toLocaleString().padStart(10)}`);
      totalRecords += count;
    }

    console.log('─'.repeat(50));
    console.log(`  ${'TOTAL'.padEnd(25)} ${totalRecords.toLocaleString().padStart(10)}`);
    console.log('');
  }

  /**
   * Get all data
   */
  getData() {
    return this.data;
  }
}

export default DataGenerator;
