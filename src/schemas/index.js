/**
 * ecom-synth - Schema Definitions
 *
 * These schemas define the synthetic data structure for e-commerce
 * conversion funnel analysis and AI/ML training.
 *
 * All tables follow database best practices:
 * - PRIMARY KEY defined on every table
 * - PostgreSQL-compatible data types
 * - Referential integrity between tables
 */

export const SCHEMAS = {
  // ============================================
  // PARENT TABLES (Required for foreign keys)
  // ============================================

  /**
   * Workspaces - Business accounts/tenants
   * Analytics use: Multi-tenant data isolation
   */
  workspaces: {
    name: 'workspaces',
    description: 'Business workspaces/tenants',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Unique workspace identifier' },
      name: { type: 'text', description: 'Workspace display name' },
      slug: { type: 'text', description: 'URL-friendly identifier' },
      created_at: { type: 'timestamptz', description: 'Created timestamp' },
      updated_at: { type: 'timestamptz', description: 'Updated timestamp' }
    },
    analyticsUse: 'Multi-tenant aggregation, workspace-level analytics'
  },

  /**
   * Accounts - Connected social/e-commerce accounts
   * Analytics use: Cross-platform attribution
   */
  accounts: {
    name: 'accounts',
    description: 'Connected social/e-commerce accounts',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Unique account identifier' },
      workspace_id: { type: 'uuid', description: 'Parent workspace' },
      platform: { type: 'text', description: 'Platform type (instagram, shopify)' },
      platform_account_id: { type: 'text', description: 'Platform-specific account ID' },
      platform_username: { type: 'text', description: 'Account username/handle' },
      status: { type: 'text', description: 'Account status (active/inactive)' },
      created_at: { type: 'timestamptz', description: 'Created timestamp' }
    },
    analyticsUse: 'Cross-platform attribution, account performance'
  },

  // ============================================
  // CORE TABLES (From JKO Real Schema)
  // ============================================

  /**
   * Products - Shopify product catalog
   * Analytics use: Inventory optimization, pricing
   */
  products: {
    name: 'products',
    description: 'Product catalog from Shopify stores',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Unique product identifier' },
      workspace_id: { type: 'uuid', description: 'Workspace that owns this product' },
      account_id: { type: 'uuid', description: 'Shopify store account' },
      shopify_product_id: { type: 'text', description: 'Shopify product ID' },
      title: { type: 'text', description: 'Product name' },
      description: { type: 'text', description: 'Product description' },
      vendor: { type: 'text', description: 'Brand/vendor name' },
      product_type: { type: 'text', description: 'Product category' },
      tags: { type: 'text[]', description: 'Product tags' },
      price_cents: { type: 'integer', description: 'Price in cents' },
      compare_at_price_cents: { type: 'integer', description: 'Original price for sales' },
      cost_cents: { type: 'integer', description: 'Cost of goods' },
      total_inventory: { type: 'integer', description: 'Total stock across variants' },
      has_variants_in_stock: { type: 'boolean', description: 'Any variants available?' },
      lowest_stock_level: { type: 'integer', description: 'Minimum variant stock' },
      variants_count: { type: 'integer', description: 'Number of variants' },
      status: { type: 'text', description: 'active/draft/archived' },
      created_at: { type: 'timestamptz', description: 'When product was created' },
      updated_at: { type: 'timestamptz', description: 'Last update timestamp' }
    },
    analyticsUse: 'Inventory planning, price optimization, demand forecasting'
  },

  /**
   * Product Variants - Size/color combinations
   * Analytics use: SKU-level inventory optimization
   */
  product_variants: {
    name: 'product_variants',
    description: 'Product variants (size, color, etc.)',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Unique variant identifier' },
      product_id: { type: 'uuid', description: 'Parent product' },
      shopify_variant_id: { type: 'text', description: 'Shopify variant ID' },
      title: { type: 'text', description: 'Variant title (e.g., "Small / Blue")' },
      sku: { type: 'text', description: 'SKU code' },
      size: { type: 'text', description: 'Size value' },
      color: { type: 'text', description: 'Color value' },
      price_cents: { type: 'integer', description: 'Variant price' },
      inventory_quantity: { type: 'integer', description: 'Stock level' },
      available: { type: 'boolean', description: 'Is variant available?' },
      created_at: { type: 'timestamptz', description: 'Created timestamp' },
      updated_at: { type: 'timestamptz', description: 'Updated timestamp' }
    },
    analyticsUse: 'SKU-level planning, size recommendation'
  },

  /**
   * Inventory History - Stock changes over time
   * Analytics use: Demand forecasting, reorder prediction
   */
  inventory_history: {
    name: 'inventory_history',
    description: 'Historical inventory changes',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Unique record ID' },
      variant_id: { type: 'uuid', description: 'Product variant' },
      product_id: { type: 'uuid', description: 'Parent product' },
      previous_quantity: { type: 'integer', description: 'Stock before change' },
      new_quantity: { type: 'integer', description: 'Stock after change' },
      change_amount: { type: 'integer', description: 'Delta (can be negative)' },
      change_source: { type: 'text', description: 'sale/restock/adjustment/return' },
      change_reason: { type: 'text', description: 'Reason for change' },
      recorded_at: { type: 'timestamptz', description: 'When change occurred' }
    },
    analyticsUse: 'Time series analysis, demand patterns, reorder triggers'
  },

  /**
   * Social Posts - Instagram content
   * Analytics use: Content performance optimization
   */
  social_posts: {
    name: 'social_posts',
    description: 'Instagram posts from connected accounts',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Unique post ID' },
      workspace_id: { type: 'uuid', description: 'Workspace owner' },
      account_id: { type: 'uuid', description: 'Instagram account' },
      platform_post_id: { type: 'text', description: 'Instagram post ID' },
      media_type: { type: 'text', description: 'IMAGE/VIDEO/CAROUSEL' },
      caption: { type: 'text', description: 'Post caption' },
      permalink: { type: 'text', description: 'Post URL' },
      product_id: { type: 'uuid', description: 'Linked product (if any)', nullable: true },
      posted_at: { type: 'timestamptz', description: 'When posted' },
      created_at: { type: 'timestamptz', description: 'Record created' }
    },
    analyticsUse: 'Content-to-conversion correlation, posting time optimization'
  },

  /**
   * Post Metrics - Engagement data
   * Analytics use: Content performance, virality prediction
   */
  post_metrics: {
    name: 'post_metrics',
    description: 'Instagram post engagement metrics',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Unique metric record' },
      post_id: { type: 'uuid', description: 'Related post' },
      account_id: { type: 'uuid', description: 'Instagram account' },
      metric_date: { type: 'date', description: 'Date of metrics' },
      metric_hour: { type: 'integer', description: 'Hour (0-23)' },
      impressions: { type: 'integer', description: 'Total impressions' },
      reach: { type: 'integer', description: 'Unique users reached' },
      likes: { type: 'integer', description: 'Like count' },
      comments: { type: 'integer', description: 'Comment count' },
      shares: { type: 'integer', description: 'Share count' },
      saves: { type: 'integer', description: 'Save count' },
      engagement_rate: { type: 'numeric(5,2)', description: 'Engagement percentage' },
      created_at: { type: 'timestamptz', description: 'Record timestamp' }
    },
    analyticsUse: 'Engagement prediction, optimal posting time'
  },

  /**
   * Garment Bindings - Post-to-product associations
   * Analytics use: Conversion funnel optimization
   */
  garment_bindings: {
    name: 'garment_bindings',
    description: 'Links between posts and products for virtual try-on',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Unique binding ID' },
      post_id: { type: 'uuid', description: 'Instagram post' },
      product_id: { type: 'uuid', description: 'Linked product' },
      workspace_id: { type: 'uuid', description: 'Workspace owner' },
      account_id: { type: 'uuid', description: 'Instagram account' },
      garment_name: { type: 'text', description: 'Display name' },
      is_active: { type: 'boolean', description: 'Is binding active?' },
      // Conversion funnel metrics
      total_triggers: { type: 'integer', description: 'Times keyword triggered' },
      total_dm_conversations: { type: 'integer', description: 'DMs started' },
      total_photo_requests: { type: 'integer', description: 'Photos requested' },
      total_photos_received: { type: 'integer', description: 'Photos received' },
      total_generations: { type: 'integer', description: 'Try-ons started' },
      successful_generations: { type: 'integer', description: 'Try-ons completed' },
      total_purchases: { type: 'integer', description: 'Attributed purchases' },
      total_revenue_cents: { type: 'bigint', description: 'Attributed revenue' },
      // Calculated rates
      trigger_to_dm_rate: { type: 'numeric(5,2)', description: '% triggers→DMs' },
      dm_to_photo_rate: { type: 'numeric(5,2)', description: '% DMs→photos' },
      photo_to_success_rate: { type: 'numeric(5,2)', description: '% photos→success' },
      overall_conversion_rate: { type: 'numeric(5,2)', description: '% triggers→purchase' },
      // Performance metrics
      avg_response_time_ms: { type: 'integer', description: 'Avg bot response time' },
      avg_generation_time_ms: { type: 'integer', description: 'Avg try-on generation time' },
      last_used_at: { type: 'timestamptz', description: 'Last triggered' },
      created_at: { type: 'timestamptz', description: 'Created timestamp' },
      updated_at: { type: 'timestamptz', description: 'Updated timestamp' }
    },
    analyticsUse: 'PRIMARY - Full conversion funnel analysis, ROI optimization'
  },

  /**
   * Conversations - DM threads
   * Analytics use: Response timing optimization
   */
  conversations: {
    name: 'conversations',
    description: 'Instagram DM conversation threads',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Conversation ID' },
      workspace_id: { type: 'uuid', description: 'Workspace owner' },
      account_id: { type: 'uuid', description: 'Instagram account' },
      participant_id: { type: 'text', description: 'Customer Instagram ID (hashed)' },
      conversation_state: { type: 'text', description: 'State machine stage' },
      category: { type: 'text', description: 'general/tryon/support' },
      started_at: { type: 'timestamptz', description: 'Conversation start' },
      last_message_at: { type: 'timestamptz', description: 'Last message time' },
      message_count: { type: 'integer', description: 'Total messages' },
      bot_messages: { type: 'integer', description: 'Bot message count' },
      user_messages: { type: 'integer', description: 'User message count' },
      resulted_in_tryon: { type: 'boolean', description: 'Did user try on?' },
      resulted_in_purchase: { type: 'boolean', description: 'Did user buy?' },
      purchase_amount_cents: { type: 'integer', description: 'Purchase value' },
      created_at: { type: 'timestamptz', description: 'Record created' }
    },
    analyticsUse: 'Conversation-to-conversion analysis, response optimization'
  },

  /**
   * Orders - Financial transactions
   * Analytics use: Revenue attribution, LTV calculation
   */
  orders: {
    name: 'orders',
    description: 'Purchase transactions from Shopify',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Order ID' },
      workspace_id: { type: 'uuid', description: 'Workspace owner' },
      account_id: { type: 'uuid', description: 'Shopify store' },
      shopify_order_id: { type: 'text', description: 'Shopify order ID' },
      order_number: { type: 'integer', description: 'Order number' },
      customer_id: { type: 'text', description: 'Customer ID (hashed)' },
      total_price_cents: { type: 'integer', description: 'Order total' },
      subtotal_cents: { type: 'integer', description: 'Subtotal' },
      tax_cents: { type: 'integer', description: 'Tax amount' },
      shipping_cents: { type: 'integer', description: 'Shipping cost' },
      discount_cents: { type: 'integer', description: 'Discount applied' },
      line_items_count: { type: 'integer', description: 'Number of items' },
      financial_status: { type: 'text', description: 'paid/pending/refunded' },
      fulfillment_status: { type: 'text', description: 'fulfilled/partial/null' },
      // Attribution
      attributed_to_tryon: { type: 'boolean', description: 'Attributed to try-on?' },
      attribution_confidence: { type: 'text', description: 'high/medium/low' },
      conversation_id: { type: 'uuid', description: 'Linked conversation', nullable: true },
      binding_id: { type: 'uuid', description: 'Linked garment binding', nullable: true },
      // Timing
      ordered_at: { type: 'timestamptz', description: 'Order timestamp' },
      created_at: { type: 'timestamptz', description: 'Record created' }
    },
    analyticsUse: 'Revenue optimization, attribution analysis, LTV modeling'
  },

  // ============================================
  // ENHANCED TABLES (Suggested Additions)
  // ============================================

  /**
   * Customer Journeys - Full funnel event stream
   * NEW: Detailed event-level tracking for ML training
   */
  customer_journeys: {
    name: 'customer_journeys',
    description: 'Event stream of customer journey through funnel',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Event ID' },
      session_id: { type: 'uuid', description: 'Session identifier' },
      customer_id: { type: 'text', description: 'Customer ID (hashed)' },
      workspace_id: { type: 'uuid', description: 'Workspace owner' },
      // Event details
      event_type: { type: 'text', description: 'Event type (see EVENT_TYPES)' },
      event_timestamp: { type: 'timestamptz', description: 'When event occurred' },
      // Context
      source_platform: { type: 'text', description: 'instagram/shopify/website' },
      device_type: { type: 'text', description: 'mobile/desktop/tablet' },
      geo_country: { type: 'text', description: 'Country code' },
      geo_region: { type: 'text', description: 'State/region' },
      // Related entities
      post_id: { type: 'uuid', description: 'Related post', nullable: true },
      product_id: { type: 'uuid', description: 'Related product', nullable: true },
      conversation_id: { type: 'uuid', description: 'Related conversation', nullable: true },
      // Outcome tracking
      funnel_stage: { type: 'integer', description: '1=aware, 2=interest, 3=try, 4=buy' },
      converted_to_next_stage: { type: 'boolean', description: 'Did proceed to next stage?' },
      time_to_next_event_seconds: { type: 'integer', description: 'Seconds until next event' },
      // Session context
      session_event_number: { type: 'integer', description: 'Event number in session' },
      is_session_first_event: { type: 'boolean', description: 'First event in session?' },
      is_session_last_event: { type: 'boolean', description: 'Last event in session?' }
    },
    analyticsUse: 'PRIMARY - ML training data, journey optimization, prediction models',
    isEnhancement: true
  },

  /**
   * Daily Aggregates - Pre-computed metrics
   * NEW: Aggregated daily stats for dashboards and forecasting
   */
  daily_aggregates: {
    name: 'daily_aggregates',
    description: 'Daily aggregated metrics per product/workspace',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Record ID' },
      workspace_id: { type: 'uuid', description: 'Workspace' },
      product_id: { type: 'uuid', description: 'Product (null for workspace-level)', nullable: true },
      metric_date: { type: 'date', description: 'Date of metrics' },
      // Volume metrics
      impressions: { type: 'integer', description: 'Total impressions' },
      post_engagements: { type: 'integer', description: 'Total engagements' },
      dm_conversations_started: { type: 'integer', description: 'New DMs' },
      tryons_completed: { type: 'integer', description: 'Successful try-ons' },
      orders_placed: { type: 'integer', description: 'Orders' },
      // Revenue metrics
      revenue_cents: { type: 'integer', description: 'Daily revenue' },
      attributed_revenue_cents: { type: 'integer', description: 'Attributed to try-on' },
      // Conversion metrics
      impression_to_dm_rate: { type: 'numeric(5,4)', description: 'Impressions→DMs' },
      dm_to_tryon_rate: { type: 'numeric(5,4)', description: 'DMs→Try-ons' },
      tryon_to_purchase_rate: { type: 'numeric(5,4)', description: 'Try-ons→Purchases' },
      overall_conversion_rate: { type: 'numeric(5,4)', description: 'Impressions→Purchases' },
      // Inventory metrics
      inventory_start: { type: 'integer', description: 'Stock at day start' },
      inventory_end: { type: 'integer', description: 'Stock at day end' },
      units_sold: { type: 'integer', description: 'Units sold today' },
      // External factors
      day_of_week: { type: 'integer', description: '0=Sunday, 6=Saturday' },
      is_weekend: { type: 'boolean', description: 'Is weekend?' },
      is_holiday: { type: 'boolean', description: 'Is holiday?' },
      weather_condition: { type: 'text', description: 'sunny/cloudy/rainy/etc' }
    },
    analyticsUse: 'Time series forecasting, seasonality analysis, demand prediction',
    isEnhancement: true
  },

  /**
   * Customer Profiles - Aggregated customer data
   * NEW: Customer-level analytics for LTV and segmentation
   */
  customer_profiles: {
    name: 'customer_profiles',
    description: 'Aggregated customer behavior profiles',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Profile ID' },
      customer_id: { type: 'text', description: 'Hashed customer identifier' },
      workspace_id: { type: 'uuid', description: 'Workspace' },
      // Engagement history
      first_seen_at: { type: 'timestamptz', description: 'First interaction' },
      last_seen_at: { type: 'timestamptz', description: 'Last interaction' },
      total_sessions: { type: 'integer', description: 'Total sessions' },
      total_dm_conversations: { type: 'integer', description: 'DM conversations' },
      total_tryons: { type: 'integer', description: 'Try-ons completed' },
      total_purchases: { type: 'integer', description: 'Orders placed' },
      // Revenue metrics
      total_revenue_cents: { type: 'bigint', description: 'Lifetime revenue' },
      avg_order_value_cents: { type: 'integer', description: 'Average order value' },
      // Behavior patterns
      preferred_device: { type: 'text', description: 'Most used device' },
      preferred_time_of_day: { type: 'text', description: 'morning/afternoon/evening/night' },
      preferred_day_of_week: { type: 'integer', description: 'Most active day' },
      // ML predictions
      predicted_ltv_cents: { type: 'integer', description: 'Predicted lifetime value' },
      churn_probability: { type: 'numeric(5,4)', description: 'Probability of churning' },
      next_purchase_probability: { type: 'numeric(5,4)', description: 'Will buy in 30 days?' },
      customer_segment: { type: 'text', description: 'high_value/regular/at_risk/churned' },
      // Timestamps
      created_at: { type: 'timestamptz', description: 'Profile created' },
      updated_at: { type: 'timestamptz', description: 'Profile updated' }
    },
    analyticsUse: 'Customer segmentation, LTV prediction, personalization',
    isEnhancement: true
  },

  /**
   * Demand Forecasts - HyperC prediction outputs
   * NEW: Store HyperC's demand predictions for validation
   */
  demand_forecasts: {
    name: 'demand_forecasts',
    description: 'Demand forecasts generated by HyperC',
    primaryKey: 'id',
    columns: {
      id: { type: 'uuid', description: 'Forecast ID' },
      product_id: { type: 'uuid', description: 'Product being forecasted' },
      variant_id: { type: 'uuid', description: 'Variant (optional)', nullable: true },
      workspace_id: { type: 'uuid', description: 'Workspace' },
      // Forecast details
      forecast_date: { type: 'date', description: 'Date being predicted' },
      forecast_horizon_days: { type: 'integer', description: 'Days ahead forecasted' },
      predicted_demand: { type: 'integer', description: 'Predicted units' },
      confidence_interval_low: { type: 'integer', description: 'Lower bound (95%)' },
      confidence_interval_high: { type: 'integer', description: 'Upper bound (95%)' },
      prediction_confidence: { type: 'numeric(5,4)', description: 'Model confidence' },
      // Actual outcome (filled in later)
      actual_demand: { type: 'integer', description: 'Actual units sold', nullable: true },
      forecast_error: { type: 'numeric(8,4)', description: 'MAPE error', nullable: true },
      // Model metadata
      model_version: { type: 'text', description: 'HyperC model version' },
      features_used: { type: 'text[]', description: 'Input features' },
      generated_at: { type: 'timestamptz', description: 'When forecast was made' }
    },
    analyticsUse: 'Forecast validation, model improvement, inventory planning',
    isEnhancement: true
  }
};

// Event types for customer_journeys table
export const EVENT_TYPES = {
  // Awareness stage
  POST_VIEW: 'post_view',
  POST_LIKE: 'post_like',
  POST_COMMENT: 'post_comment',
  POST_SAVE: 'post_save',
  POST_SHARE: 'post_share',

  // Interest stage
  DM_STARTED: 'dm_started',
  TRIGGER_KEYWORD: 'trigger_keyword',
  BOT_GREETING: 'bot_greeting',

  // Consideration stage
  PHOTO_REQUESTED: 'photo_requested',
  PHOTO_RECEIVED: 'photo_received',
  TRYON_STARTED: 'tryon_started',
  TRYON_COMPLETED: 'tryon_completed',
  TRYON_FAILED: 'tryon_failed',

  // Conversion stage
  PRODUCT_LINK_CLICKED: 'product_link_clicked',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',

  // Post-purchase
  REVIEW_SUBMITTED: 'review_submitted',
  RETURN_INITIATED: 'return_initiated',
  REPEAT_VISIT: 'repeat_visit'
};

// Funnel stage mapping
export const FUNNEL_STAGES = {
  1: 'Awareness',
  2: 'Interest',
  3: 'Consideration',
  4: 'Purchase',
  5: 'Retention'
};

export default SCHEMAS;
