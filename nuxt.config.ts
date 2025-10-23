// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // 禁用SSR以避免hydration问题

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image'
  ],

  // Image Optimization (Phase 6 Sprint 3)
  image: {
    formats: ['webp', 'png', 'jpeg'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    densities: [1, 2],
    presets: {
      avatar: {
        modifiers: {
          format: 'webp',
          width: 200,
          height: 200,
          fit: 'cover'
        }
      },
      thumbnail: {
        modifiers: {
          format: 'webp',
          width: 400,
          height: 300,
          fit: 'cover'
        }
      },
      hero: {
        modifiers: {
          format: 'webp',
          width: 1200,
          height: 600,
          fit: 'cover'
        }
      }
    }
  },

  // Performance Optimization (Phase 6 Sprint 3)
  vite: {
    build: {
      // Enable tree shaking
      modulePreload: true,
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      // Rollup options for code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor splitting for better caching
            'vue-vendor': ['vue', 'vue-router', '@vue/runtime-core'],
            'pinia': ['pinia']
          }
        },
        external: [
          '@oxc-parser/binding-wasm32-wasi',
          '@oxc-transform/binding-wasm32-wasi',
          'webpack'
        ]
      }
    },
    // Optimize deps
    optimizeDeps: {
      include: ['vue', 'pinia'],
      exclude: [
        'fsevents',
        '@oxc-parser/binding-wasm32-wasi',
        '@oxc-transform/binding-wasm32-wasi',
        'webpack'
      ]
    }
  },

  // Experimental features for performance
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    componentIslands: false,
    viewTransition: true
  },

  // Route Rules for caching and optimization
  routeRules: {
    // Static pages - cache aggressively
    '/': { prerender: true },
    '/outline': { prerender: true },
    // API routes - cache with revalidation
    '/api/**': {
      cors: true,
      headers: {
        'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      }
    },
    // Admin routes - no cache
    '/admin/**': {
      ssr: false,
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate'
      }
    },
    // Static assets - cache for 1 year
    '/_nuxt/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable'
      }
    }
  },

  nitro: {
    experimental: {
      openAPI: true
    },
    // Nitro compression
    compressPublicAssets: true,
    // Minify output
    minify: true,
    // Prerender routes
    prerender: {
      crawlLinks: true,
      routes: ['/', '/outline']
    },
    // Rollup configuration for Nitro
    rollupConfig: {
      external: [
        'node-cron',
        '@oxc-parser/binding-wasm32-wasi',
        '@oxc-transform/binding-wasm32-wasi',
        'webpack',
        'fsevents'
      ]
    }
  },

  runtimeConfig: {
    public: {
      appName: 'Cale 加州中医考试系统',
      appUrl: process.env.APP_URL || 'http://localhost:3001'
    }
  },

  // PWA Configuration (Phase 6 Sprint 1)
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'theme-color', content: '#667eea' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'CALE考试' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icons/icon-512x512.png' },
        { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
        // Preconnect to external domains for faster loading
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }
      ]
    }
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    shim: false
  }
})
