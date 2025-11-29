/**
 * ecom-synth - Configuration
 *
 * Research-backed parameters for realistic synthetic data generation.
 * Sources: Dynamic Yield, Sprout Social, Later, Rival IQ, Adobe, Napolify
 */

export const CONFIG = {
  // Scale presets
  scales: {
    small: {
      name: 'Small',
      description: 'Quick test dataset (~4,000 records)',
      workspaces: 2,
      productsPerWorkspace: 10,
      variantsPerProduct: 3,
      postsPerWorkspace: 20,
      conversationsPerWorkspace: 50,
      ordersPerWorkspace: 30,
      daysOfHistory: 30,
      customersPerWorkspace: 200  // More customers for realistic funnel
    },
    medium: {
      name: 'Medium',
      description: 'Development dataset (~50,000 records)',
      workspaces: 5,
      productsPerWorkspace: 50,
      variantsPerProduct: 4,
      postsPerWorkspace: 100,
      conversationsPerWorkspace: 500,
      ordersPerWorkspace: 200,
      daysOfHistory: 90,
      customersPerWorkspace: 1000
    },
    large: {
      name: 'Large',
      description: 'Production-like dataset (~300,000 records)',
      workspaces: 10,
      productsPerWorkspace: 200,
      variantsPerProduct: 5,
      postsPerWorkspace: 500,
      conversationsPerWorkspace: 2000,
      ordersPerWorkspace: 1000,
      daysOfHistory: 180,
      customersPerWorkspace: 5000
    },
    planning: {
      name: 'Planning Optimized',
      description: 'Optimized for AI planning algorithms',
      workspaces: 3,
      productsPerWorkspace: 100,
      variantsPerProduct: 6,
      postsPerWorkspace: 200,
      conversationsPerWorkspace: 1000,
      ordersPerWorkspace: 500,
      daysOfHistory: 365,  // Full year for seasonality
      customersPerWorkspace: 2000
    }
  },

  // ============================================
  // RESEARCH-BACKED CONVERSION FUNNEL
  // Sources: Dynamic Yield, Napolify, Rival IQ
  // ============================================
  funnelRates: {
    // Instagram engagement rate for fashion brands: 0.68-0.99%
    // Source: Rival IQ 2024 Social Media Benchmark
    impressionToEngagement: { min: 0.006, max: 0.012 },  // 0.6-1.2%

    // Engagement to DM: Very rare, <5% of engaged users
    // Source: Industry analysis
    engagementToDM: { min: 0.02, max: 0.08 },  // 2-8% of engaged

    // DM to Photo (for try-on): High intent users
    dmToPhotoRequest: { min: 0.60, max: 0.85 },  // 60-85%

    // Photo Request to Received: Drop-off due to friction
    photoRequestToReceived: { min: 0.35, max: 0.55 },  // 35-55%

    // Photo to Try-on Completed: Technical success rate
    photoToTryon: { min: 0.80, max: 0.95 },  // 80-95%

    // Try-on to Link Click: Users who click product link
    // Source: Industry analysis
    tryonToLinkClick: { min: 0.40, max: 0.65 },  // 40-65%

    // Link Click to Purchase: Final conversion step
    // Cart abandonment is 77.1%, so ~23% complete purchase
    linkClickToPurchase: { min: 0.15, max: 0.30 },  // 15-30%

    // Try-on boost: +44% add-to-cart, +27% purchase likelihood
    // Source: Grand View Research, WANNA Fashion
    tryonConversionBoost: 1.44,

    // DM to Sale conversion rates by account size
    // Source: Napolify 2025
    dmToSale: {
      nano: { min: 0.05, max: 0.10 },      // <10K followers: 5-10%
      micro: { min: 0.15, max: 0.25 },     // 10K-100K: 15-25%
      macro: { min: 0.02, max: 0.05 }      // >100K: 2-5%
    },

    // Cart abandonment rate: 77.1% for fashion
    // Source: Dynamic Yield, ECDB
    cartAbandonmentRate: 0.771,

    // Add-to-cart rate: 13.6% of visitors
    // Source: ECDB Fashion Benchmarks
    addToCartRate: 0.136,

    // Overall site conversion: 2.9-3.3% fashion
    // Source: Dynamic Yield, Oberlo
    overallConversion: { min: 0.025, max: 0.035 }
  },

  // ============================================
  // SEASONAL PATTERNS
  // Source: Syncio, Adobe Holiday Report, Productsup
  // ============================================
  seasonality: {
    // Monthly multipliers (vs average)
    // November +29%, September +7%, October -16%, Feb/Mar slowest
    monthly: {
      1: 0.85,   // January - post-holiday slowdown
      2: 0.75,   // February - slowest month
      3: 0.78,   // March - still slow
      4: 0.92,   // April - spring pickup
      5: 0.98,   // May - steady
      6: 0.95,   // June - summer dip
      7: 0.88,   // July - summer slowdown
      8: 0.92,   // August - back-to-school starts
      9: 1.07,   // September - +7% vs average
      10: 0.84,  // October - pre-holiday lull (-16%)
      11: 1.29,  // November - peak (+29%)
      12: 1.15   // December - holiday rush
    },

    // Black Friday / Cyber Monday boost
    blackFridayBoost: 3.5,  // 3.5x normal
    cyberMondayBoost: 2.8,  // 2.8x normal

    // Holiday periods
    holidayBoosts: {
      valentines: 1.3,      // Feb 10-14
      easter: 1.15,         // Variable
      mothersDay: 1.25,     // 2nd Sun May
      fathersDay: 1.15,     // 3rd Sun June
      backToSchool: 1.2,    // Aug-Sep
      halloween: 1.1,       // Oct 25-31
      christmas: 1.4        // Dec 15-24
    }
  },

  // ============================================
  // TIME-OF-DAY PATTERNS
  // Source: Sprout Social, Later, Hootsuite 2025
  // ============================================
  engagement: {
    // Hour weights based on 2025 Instagram research
    // Peak: 7-9 AM, 11 AM-1 PM, 5-9 PM
    hourlyWeights: [
      0.008, 0.005, 0.004, 0.004, 0.006, 0.015,  // 0-5am (very low)
      0.025, 0.055, 0.070, 0.065, 0.055, 0.075,  // 6-11am (morning peak)
      0.080, 0.070, 0.050, 0.045, 0.050, 0.065,  // 12-5pm (afternoon dip)
      0.075, 0.080, 0.075, 0.055, 0.035, 0.018   // 6-11pm (evening peak)
    ],

    // Day of week - Tue-Thu best, weekends lower for business
    // Source: Sprout Social 2025
    dailyWeights: {
      0: 0.85,   // Sunday - lower
      1: 0.95,   // Monday - recovery
      2: 1.15,   // Tuesday - peak
      3: 1.20,   // Wednesday - peak
      4: 1.15,   // Thursday - peak
      5: 1.00,   // Friday - wind down
      6: 0.80    // Saturday - lowest
    },

    // Late evening surge (new 2025 pattern)
    // Source: SocialPilot - 9-11 PM now showing higher engagement
    lateEveningBoost: 1.25  // 9-11 PM multiplier
  },

  // ============================================
  // DEVICE PATTERNS
  // Source: Dynamic Yield, Smart Insights
  // ============================================
  devices: {
    distribution: {
      mobile: 0.70,    // 70% of traffic
      desktop: 0.28,   // 28% of traffic
      tablet: 0.02     // 2% of traffic
    },
    conversionMultiplier: {
      mobile: 0.85,    // Lower conversion on mobile
      desktop: 1.70,   // 1.7x higher on desktop
      tablet: 1.00     // Baseline
    },
    cartAbandonmentRate: {
      mobile: 0.762,   // 76.2% on mobile
      desktop: 0.681,  // 68.1% on desktop
      tablet: 0.720
    }
  },

  // ============================================
  // VIRTUAL TRY-ON EFFECTS
  // Source: Grand View Research, WANNA Fashion, 3DLOOK
  // ============================================
  virtualTryOn: {
    // Conversion boost from AR/VTO
    addToCartBoost: 1.44,      // +44% add-to-cart
    purchaseBoost: 1.27,       // +27% purchase likelihood
    returnReduction: 0.83,     // -17% returns

    // Engagement with 3D/AR
    engagementBoost: 1.65,     // 65% more likely to purchase if used AR

    // Success rates
    photoQualityAcceptRate: 0.85,  // 85% of photos usable
    generationSuccessRate: 0.92,   // 92% technical success
    userSatisfactionRate: 0.78     // 78% like the result
  },

  // ============================================
  // POST PERFORMANCE VARIANCE
  // Realistic distribution with outliers
  // ============================================
  postPerformance: {
    // Most posts perform average, some viral, some flop
    distribution: {
      viral: { probability: 0.03, multiplier: { min: 5, max: 15 } },     // 3% go viral
      highPerforming: { probability: 0.12, multiplier: { min: 2, max: 5 } },
      average: { probability: 0.50, multiplier: { min: 0.7, max: 1.5 } },
      underperforming: { probability: 0.25, multiplier: { min: 0.3, max: 0.7 } },
      flop: { probability: 0.10, multiplier: { min: 0.05, max: 0.3 } }
    }
  },

  // ============================================
  // PRODUCT PERFORMANCE VARIANCE
  // Some products just sell better
  // ============================================
  productPerformance: {
    // Pareto principle: 20% of products drive 80% of sales
    topPerformerPct: 0.20,
    topPerformerRevenuePct: 0.80,

    // Performance tiers
    distribution: {
      bestseller: { probability: 0.05, multiplier: { min: 3, max: 8 } },
      popular: { probability: 0.15, multiplier: { min: 1.5, max: 3 } },
      average: { probability: 0.50, multiplier: { min: 0.5, max: 1.5 } },
      slowMover: { probability: 0.20, multiplier: { min: 0.2, max: 0.5 } },
      deadStock: { probability: 0.10, multiplier: { min: 0, max: 0.2 } }
    }
  },

  // ============================================
  // PRICING (Fashion industry)
  // Source: Industry data
  // ============================================
  pricing: {
    products: {
      min: 1999,    // $19.99
      max: 29999,   // $299.99
      median: 7999  // $79.99
    },
    costMargin: {
      min: 0.30,
      max: 0.65
    },
    discountProbability: 0.18,  // 18% on sale
    discountRange: { min: 0.10, max: 0.50 },

    // Average order value by segment
    aovBySegment: {
      highValue: { min: 12000, max: 25000 },
      regular: { min: 6000, max: 12000 },
      casual: { min: 3000, max: 8000 }
    }
  },

  // ============================================
  // INVENTORY PATTERNS
  // ============================================
  inventory: {
    initialStock: { min: 10, max: 500 },
    reorderPoint: 0.20,
    dailySalesVelocity: { min: 0, max: 10 },
    stockoutProbability: 0.05,

    // Size curve (M/L peak)
    sizeDistribution: {
      'XS': 0.08,
      'S': 0.18,
      'M': 0.30,
      'L': 0.26,
      'XL': 0.13,
      'XXL': 0.05
    }
  },

  // ============================================
  // GEOGRAPHY
  // Source: Grand View Research - North America 38%
  // ============================================
  geography: {
    countries: [
      { code: 'US', weight: 0.55, conversionMult: 1.0 },
      { code: 'CA', weight: 0.08, conversionMult: 0.95 },
      { code: 'GB', weight: 0.12, conversionMult: 0.90 },
      { code: 'AU', weight: 0.06, conversionMult: 0.85 },
      { code: 'DE', weight: 0.07, conversionMult: 0.88 },
      { code: 'FR', weight: 0.05, conversionMult: 0.85 },
      { code: 'OTHER', weight: 0.07, conversionMult: 0.70 }
    ]
  },

  // ============================================
  // PRODUCT CATEGORIES (Fashion)
  // ============================================
  categories: [
    { name: 'Dresses', weight: 0.18, avgPrice: 8999, returnRate: 0.35 },
    { name: 'Tops', weight: 0.25, avgPrice: 4999, returnRate: 0.25 },
    { name: 'Pants', weight: 0.14, avgPrice: 6999, returnRate: 0.30 },
    { name: 'Outerwear', weight: 0.10, avgPrice: 14999, returnRate: 0.20 },
    { name: 'Activewear', weight: 0.12, avgPrice: 5999, returnRate: 0.22 },
    { name: 'Swimwear', weight: 0.05, avgPrice: 7999, returnRate: 0.40 },
    { name: 'Accessories', weight: 0.10, avgPrice: 3999, returnRate: 0.15 },
    { name: 'Shoes', weight: 0.06, avgPrice: 9999, returnRate: 0.28 }
  ],

  // ============================================
  // CUSTOMER BEHAVIOR
  // ============================================
  customerBehavior: {
    // Response time impact on conversion
    // Source: Napolify - 391% higher conversion with <1min response
    responseTimeImpact: {
      under1min: 3.91,    // 391% boost
      under5min: 2.50,
      under30min: 1.50,
      under1hour: 1.00,
      over1hour: 0.60
    },

    // Repeat purchase behavior
    repeatPurchaseProbability: {
      firstPurchase: 0.15,   // 15% buy again within 90 days
      secondPurchase: 0.25,  // 25% after 2nd purchase
      thirdPlus: 0.40        // 40% after 3+ purchases
    },

    // Churn timeframes
    churnDays: {
      atRisk: 30,    // No activity in 30 days
      churned: 90    // No activity in 90 days
    }
  },

  // ============================================
  // CUSTOMER SEGMENTS
  // Based on RFM analysis patterns
  // ============================================
  customerSegments: [
    { name: 'VIP', probability: 0.05, spendMultiplier: 3.0, repeatRate: 0.60 },
    { name: 'Loyal', probability: 0.15, spendMultiplier: 1.8, repeatRate: 0.40 },
    { name: 'Regular', probability: 0.30, spendMultiplier: 1.0, repeatRate: 0.20 },
    { name: 'Occasional', probability: 0.30, spendMultiplier: 0.7, repeatRate: 0.10 },
    { name: 'One-time', probability: 0.20, spendMultiplier: 0.5, repeatRate: 0.02 }
  ],

  // Sizes
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

  // Colors
  colors: [
    'Black', 'White', 'Navy', 'Gray', 'Beige',
    'Red', 'Pink', 'Blue', 'Green', 'Brown'
  ],

  // Conversation states
  conversationStates: [
    'initial',
    'greeting_sent',
    'awaiting_response',
    'photo_requested',
    'awaiting_photo',
    'processing_tryon',
    'result_sent',
    'completed',
    'abandoned'
  ],

  // Weather conditions
  weatherConditions: ['sunny', 'cloudy', 'rainy', 'snowy', 'hot', 'cold'],

  // Random seed for reproducibility
  randomSeed: null,

  // Output settings
  output: {
    includeTimestamps: true,
    dateFormat: 'ISO8601',
    nullProbability: 0.02
  }
};

export default CONFIG;
