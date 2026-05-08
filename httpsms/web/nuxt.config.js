export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s',
    title: 'Domovina SMS — Pretvorite Android telefon u SMS gateway',
    htmlAttrs: {
      lang: 'hr',
    },
    script: [
      {
        hid: 'integrations',
        src: '/integrations.js',
        async: true,
        defer: true,
      },
      {
        hid: 'cloudflare',
        src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
      },
    ],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Šaljite i primajte SMS poruke kroz svoj Android telefon putem jednostavnog HTTP API-ja. Dio platforme DOMOVINA.ai.',
      },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'theme-color', content: '#002F6C' },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: 'website',
      },
      {
        hid: 'og:locale',
        property: 'og:locale',
        content: 'hr_HR',
      },
      {
        hid: 'og:site_name',
        property: 'og:site_name',
        content: 'Domovina SMS',
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: 'Domovina SMS — Pretvorite Android telefon u SMS gateway',
      },
      {
        hid: 'og:description',
        property: 'og:description',
        content:
          'Šaljite i primajte SMS poruke kroz svoj Android telefon putem jednostavnog HTTP API-ja. Dio platforme DOMOVINA.ai.',
      },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://sms.domovina.ai/header.png',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/filters.ts',
    { src: '~/plugins/vue-glow', ssr: false },
    { src: '~/plugins/chart', ssr: false },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // Simple usage
    '@nuxtjs/dotenv',
    [
      '@nuxtjs/firebase',
      {
        config: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
          measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        },
        services: {
          analytics: true,
          auth: {
            persistence: 'local', // default
            initialize: {
              onAuthStateChangedAction: 'onAuthStateChanged',
              onIdTokenChangedAction: 'onIdTokenChanged',
              subscribeManually: false,
            },
            ssr: false,
          },
        },
      },
    ],
    // Simple Usage
    [
      'nuxt-highlightjs',
      {
        style: 'androidstudio',
      },
    ],
    '@nuxtjs/sitemap', // always put it at the end
  ],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  // Domovina brand palette: navy #002F6C primary, red #FF0000 accent.
  vuetify: {
    treeShake: true,
    customVariables: ['~/assets/variables.scss'],
    defaultAssets: {
      icons: 'mdiSvg',
    },
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#002F6C',
          secondary: '#5A6570',
          accent: '#FF0000',
          error: '#B42318',
          warning: '#B45309',
          info: '#002F6C',
          success: '#2E8540',
          background: '#FFFFFF',
        },
        dark: {
          primary: '#5C8AD6',
          secondary: '#8A95A5',
          accent: '#FF4D4D',
          error: '#F87171',
          warning: '#FBBF24',
          info: '#5C8AD6',
          success: '#3FB950',
        },
      },
    },
  },

  sitemap: {
    hostname: 'https://sms.domovina.ai',
    gzip: true,
    trailingSlash: true,
    exclude: [
      '/messages',
      '/settings',
      '/threads**',
      '/billing',
      '/bulk-messages',
    ],
  },

  publicRuntimeConfig: {
    checkoutURL: process.env.CHECKOUT_URL,
    enterpriseCheckoutURL: process.env.ENTERPRISE_CHECKOUT_URL,
    cloudflareTurnstileSiteKey: process.env.CLOUDFLARE_TURNSTILE_SITE_KEY,
    pusherKey: process.env.PUSHER_KEY,
    pusherCluster: process.env.PUSHER_CLUSTER,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['chart.js', 'vue-chartjs'],
  },

  server: {
    port: 3000,
  },
}
