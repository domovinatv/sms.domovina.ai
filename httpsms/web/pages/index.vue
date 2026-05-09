<template>
  <div class="domovina-landing">
    <!-- Hero -->
    <section class="hero">
      <v-container>
        <v-row align="center" justify="center" class="hero-row">
          <v-col cols="12" md="7" order="2" order-md="1">
            <p class="hero-eyebrow">
              <span class="dot"></span>
              <span>Self-hosted SMS gateway iz Hrvatske</span>
            </p>
            <h1 class="hero-title mt-3">
              <span class="primary--text">Vaš Android telefon</span>
              <br />kao SMS gateway
            </h1>
            <p class="hero-lede mt-5">
              Šaljite i primajte SMS poruke putem jednostavnog HTTP API-ja —
              koristeći vlastiti telefon i SIM karticu. Bez posrednika, bez
              mjesečnih naknada, potpuno pod vašom kontrolom.
            </p>
            <div class="hero-actions mt-6">
              <v-btn
                color="primary"
                large
                depressed
                :to="{ name: 'login' }"
                class="px-6"
              >
                Započni besplatno
                <v-icon right>{{ mdiArrowRight }}</v-icon>
              </v-btn>
              <v-btn
                large
                outlined
                color="primary"
                href="https://github.com/domovinatv/sms.domovina.ai"
                target="_blank"
                rel="noopener"
              >
                <v-icon left>{{ mdiGithub }}</v-icon>
                Izvorni kod
              </v-btn>
            </div>
            <p class="hero-meta mt-4 mb-0">
              Dio platforme
              <a
                href="https://domovina.ai"
                class="text-decoration-none font-weight-bold primary--text"
                >DOMOVINA.ai</a
              >
              <span class="hero-meta__sep">·</span>
              MIT licenca
              <span class="hero-meta__sep">·</span>
              Bez registracije za testiranje
            </p>
          </v-col>
          <v-col cols="12" md="5" order="1" order-md="2" class="text-center hero-visual">
            <v-img
              :src="require('@/assets/img/logo.svg')"
              :max-width="$vuetify.breakpoint.smAndDown ? 140 : 320"
              class="mx-auto"
              contain
              alt="Domovina SMS logotip"
            />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features -->
    <section class="features py-12 py-md-16">
      <v-container>
        <v-row justify="center" class="mb-8 mb-md-12">
          <v-col cols="12" md="8" class="text-center">
            <p class="section-eyebrow">Što radi</p>
            <h2 class="section-title">Sve što vam treba</h2>
            <p class="section-sub mt-3 mb-0">
              Profesionalni SMS gateway s vlastitim Android telefonom.
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="f in features" :key="f.title" cols="12" sm="6" md="4">
            <v-card outlined class="feature-card pa-6 fill-height" flat>
              <div class="feature-icon-wrap" :class="`feature-icon-wrap--${f.iconColor}`">
                <v-icon size="28" :color="f.iconColor">{{ f.icon }}</v-icon>
              </div>
              <h3 class="text-h6 font-weight-bold mt-4 mb-2 primary--text">
                {{ f.title }}
              </h3>
              <p class="body-2 text--secondary mb-0">{{ f.body }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Quick start -->
    <section class="quick-start py-12 py-md-16">
      <v-container>
        <v-row justify="center" class="mb-8 mb-md-12">
          <v-col cols="12" md="8" class="text-center">
            <p class="section-eyebrow">Brz početak</p>
            <h2 class="section-title">Tri koraka do prvog SMS-a</h2>
            <p class="section-sub mt-3 mb-0">
              Od instalacije do HTTP API poziva.
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <div class="step">
              <div class="step-num">1</div>
              <h3 class="text-h6 font-weight-bold mt-4 mb-2 primary--text">
                Instalirajte aplikaciju
              </h3>
              <p class="body-2 text--secondary mb-0">
                Preuzmite zadnji APK s
                <a
                  href="https://github.com/domovinatv/sms.domovina.ai/releases"
                  target="_blank"
                  rel="noopener"
                  class="text-decoration-none primary--text font-weight-bold"
                  >GitHub Releases</a
                >
                stranice. Radi na Androidu 8 i novijem.
              </p>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="step">
              <div class="step-num">2</div>
              <h3 class="text-h6 font-weight-bold mt-4 mb-2 primary--text">
                Generirajte API ključ
              </h3>
              <p class="body-2 text--secondary mb-0">
                Prijavite se i u izborniku
                <nuxt-link
                  :to="{ name: 'phone-api-keys' }"
                  class="text-decoration-none primary--text font-weight-bold"
                  >API ključevi telefona</nuxt-link
                >
                kreirajte ključ. Unesite ga u Android aplikaciju — telefon je
                spojen.
              </p>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="step">
              <div class="step-num">3</div>
              <h3 class="text-h6 font-weight-bold mt-4 mb-2 primary--text">
                Pošaljite SMS preko HTTP-a
              </h3>
              <p class="body-2 text--secondary mb-0">
                <code>POST /v1/messages/send</code> s
                <code>from</code>, <code>to</code> i <code>content</code>.
                Odgovor stiže u milisekundama; SMS izlazi s vašeg telefona.
              </p>
            </div>
          </v-col>
        </v-row>
        <v-row class="mt-8 mt-md-10">
          <v-col cols="12" md="10" offset-md="1">
            <div class="snippet-wrap">
              <div class="snippet-bar">
                <span class="snippet-bar__dot snippet-bar__dot--red"></span>
                <span class="snippet-bar__dot snippet-bar__dot--yellow"></span>
                <span class="snippet-bar__dot snippet-bar__dot--green"></span>
                <span class="snippet-bar__title">curl</span>
              </div>
              <pre class="snippet"><code>curl --location 'https://sms-api.domovina.ai/v1/messages/send' \
  --header 'x-api-key: VAS_API_KLJUC' \
  --header 'Content-Type: application/json' \
  --data '{
    "from": "+385998710482",
    "to":   "+385991234567",
    "content": "Pozdrav iz Domovina SMS-a!"
  }'</code></pre>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Closing CTA -->
    <section class="closing">
      <v-container>
        <div class="closing-card">
          <h2 class="closing-title">Spremni za vlastiti SMS gateway?</h2>
          <p class="closing-sub">
            Besplatno, otvorenog koda, neovisno o trećim stranama. Postavlja se
            za pet minuta.
          </p>
          <div class="closing-actions">
            <v-btn color="white" large depressed :to="{ name: 'login' }" class="closing-cta">
              Započni besplatno
              <v-icon right>{{ mdiArrowRight }}</v-icon>
            </v-btn>
            <v-btn
              large
              text
              dark
              href="https://github.com/domovinatv/sms.domovina.ai"
              target="_blank"
              rel="noopener"
            >
              <v-icon left>{{ mdiGithub }}</v-icon>
              GitHub
            </v-btn>
          </div>
        </div>
      </v-container>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  mdiArrowRight,
  mdiGithub,
  mdiCellphoneMessage,
  mdiWebhook,
  mdiKeyChainVariant,
  mdiShieldLockOutline,
  mdiClockOutline,
  mdiHomeHeart,
} from '@mdi/js'

export default Vue.extend({
  name: 'IndexPage',
  layout: 'website',
  data() {
    return {
      mdiArrowRight,
      mdiGithub,
      features: [
        {
          icon: mdiCellphoneMessage,
          iconColor: 'primary',
          title: 'Slanje i primanje SMS-ova',
          body: 'Jednostavan REST API: POST za slanje, webhook za dolazne. Obostrana komunikacija kroz vaš telefon.',
        },
        {
          icon: mdiWebhook,
          iconColor: 'accent',
          title: 'Webhookovi za dolazne poruke',
          body: 'Konfigurirajte webhook URL i primajte događaje u stvarnom vremenu, sa HMAC potpisom.',
        },
        {
          icon: mdiKeyChainVariant,
          iconColor: 'primary',
          title: 'Više telefona, više brojeva',
          body: 'Spojite N Android uređaja s različitim SIM karticama. Sustav ravnomjerno raspoređuje promet i automatski preusmjerava ako jedan padne.',
        },
        {
          icon: mdiShieldLockOutline,
          iconColor: 'accent',
          title: 'Reverse OTP verifikacija',
          body: 'Provjerite broj telefona obrnutim SMS protokolom — korisnik šalje SMS, vaš servis verificira. Demo na otp.domovina.ai.',
        },
        {
          icon: mdiClockOutline,
          iconColor: 'primary',
          title: 'Zakazane i masovne poruke',
          body: 'Pošaljite poruku u budućnosti, ili tisuće poruka iz CSV/XLSX datoteke kroz sučelje.',
        },
        {
          icon: mdiHomeHeart,
          iconColor: 'accent',
          title: 'Otvoreni kod, vaš stack',
          body: 'Otvoreni izvor pod MIT licencom. Cijeli stack pod vašom kontrolom — Android aplikacija, API i web sučelje.',
        },
      ],
    }
  },
})
</script>

<style lang="scss" scoped>
$navy: #002f6c;
$red: #ff0000;
$muted: #5a6570;
$border: #e1e5ea;

.domovina-landing {
  background: #ffffff;
}

// ── Hero ──────────────────────────────────────────────────────────────
.hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at top right, rgba(0, 47, 108, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at bottom left, rgba(255, 0, 0, 0.04) 0%, transparent 60%);
}
.hero-row {
  padding: 3rem 0;
}
@media (min-width: 960px) {
  .hero-row { padding: 5rem 0; }
}
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: $muted;
  margin: 0;
  padding: 0.35rem 0.7rem;
  background: rgba(0, 47, 108, 0.05);
  border-radius: 999px;
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2e8540;
    box-shadow: 0 0 0 3px rgba(46, 133, 64, 0.2);
  }
}
.hero-title {
  font-size: 3.2rem;
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.015em;
  color: $navy;
  margin: 0;
}
.hero-lede {
  font-size: 1.15rem;
  line-height: 1.6;
  color: $muted;
  max-width: 36rem;
  margin: 0;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.hero-meta {
  font-size: 0.85rem;
  color: $muted;
  &__sep {
    margin: 0 0.5rem;
    opacity: 0.5;
  }
}
.hero-visual {
  ::v-deep .v-image {
    filter: drop-shadow(0 12px 32px rgba(0, 47, 108, 0.12));
  }
}
@media (max-width: 600px) {
  .hero-title { font-size: 2.05rem; }
  .hero-lede { font-size: 1rem; }
  .hero-meta__sep { display: block; height: 0; visibility: hidden; }
  .hero-visual { margin-bottom: 0.5rem; }
}

// ── Common section bits ──────────────────────────────────────────────
.section-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $red;
  margin: 0;
}
.section-title {
  font-size: 2.25rem;
  line-height: 1.15;
  font-weight: 900;
  color: $navy;
  margin: 0.4rem 0 0;
  letter-spacing: -0.01em;
}
.section-sub {
  font-size: 1.05rem;
  color: $muted;
}
@media (max-width: 600px) {
  .section-title { font-size: 1.6rem; }
  .section-sub { font-size: 0.95rem; }
}

// ── Features ──────────────────────────────────────────────────────────
.feature-card {
  border-color: $border !important;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  &:hover {
    border-color: $navy !important;
    box-shadow: 0 12px 24px rgba(0, 47, 108, 0.08);
    transform: translateY(-2px);
  }
}
.feature-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &--primary { background: rgba(0, 47, 108, 0.08); }
  &--accent { background: rgba(255, 0, 0, 0.06); }
}

// ── Quick start ───────────────────────────────────────────────────────
.quick-start {
  background: #f5f7f9;
}
.step {
  position: relative;
  padding-right: 1rem;
}
.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: $navy;
  color: #ffffff;
  font-weight: 800;
  font-size: 1.05rem;
  box-shadow: 0 4px 12px rgba(0, 47, 108, 0.25);
}

.snippet-wrap {
  border: 1px solid $border;
  border-radius: 10px;
  overflow: hidden;
  background: $navy;
  box-shadow: 0 12px 40px rgba(0, 47, 108, 0.12);
}
.snippet-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  &__dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    &--red { background: #ff5f56; }
    &--yellow { background: #ffbd2e; }
    &--green { background: #27c93f; }
  }
  &__title {
    margin-left: 0.6rem;
    color: rgba(255, 255, 255, 0.55);
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.8rem;
    letter-spacing: 0.02em;
  }
}
.snippet {
  margin: 0;
  padding: 1.1rem 1.25rem;
  background: $navy;
  color: #e6edf3;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
  -webkit-overflow-scrolling: touch;
}
@media (max-width: 600px) {
  .snippet { font-size: 0.75rem; padding: 0.9rem 1rem; }
}

// ── Closing CTA ──────────────────────────────────────────────────────
.closing {
  padding: 4rem 0;
}
.closing-card {
  background: linear-gradient(135deg, $navy 0%, #001d4a 100%);
  border-radius: 16px;
  padding: 3.5rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 47, 108, 0.2);
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      to right,
      $red 0%, $red 33.33%,
      #ffffff 33.33%, #ffffff 66.66%,
      #ffffff 66.66%, #ffffff 100%
    );
  }
}
.closing-title {
  font-size: 2.2rem;
  line-height: 1.15;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.01em;
}
.closing-sub {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.05rem;
  margin: 0.8rem auto 1.6rem;
  max-width: 38rem;
}
.closing-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.closing-cta {
  color: $navy !important;
  font-weight: 700;
}
@media (max-width: 600px) {
  .closing { padding: 2.5rem 0; }
  .closing-card { padding: 2.5rem 1.25rem; }
  .closing-title { font-size: 1.5rem; }
  .closing-sub { font-size: 0.95rem; }
}
</style>
