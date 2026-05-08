<template>
  <div class="domovina-landing">
    <!-- Hero -->
    <section class="hero">
      <v-container>
        <v-row align="center" justify="center" class="py-12">
          <v-col cols="12" md="7">
            <h1 class="hero-title">
              <span class="primary--text">Vaš Android telefon</span>
              <br />kao SMS gateway
            </h1>
            <p class="hero-lede mt-6">
              Šaljite i primajte SMS poruke putem jednostavnog HTTP API-ja —
              koristeći vlastiti telefon i SIM karticu. Bez posrednika, bez
              mjesečnih naknada, potpuno pod vašom kontrolom.
            </p>
            <div class="mt-8 d-flex flex-wrap" style="gap: 0.75rem">
              <v-btn
                color="primary"
                large
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
            <p class="caption text--secondary mt-4 mb-0">
              Self-hosted SMS gateway. Otvorenog koda. Dio platforme
              <a
                href="https://domovina.ai"
                class="text-decoration-none font-weight-bold primary--text"
                >DOMOVINA.ai</a
              >.
            </p>
          </v-col>
          <v-col cols="12" md="5" class="text-center">
            <v-img
              :src="require('@/assets/img/logo.svg')"
              :max-width="$vuetify.breakpoint.smAndDown ? 220 : 360"
              class="mx-auto"
              contain
            />
          </v-col>
        </v-row>
      </v-container>
      <div class="tricolor-stripe-thin" />
    </section>

    <!-- Features -->
    <section class="features py-12">
      <v-container>
        <v-row justify="center" class="mb-8">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-h3 font-weight-black primary--text">
              Sve što vam treba
            </h2>
            <p class="subtitle-1 text--secondary mt-3 mb-0">
              Profesionalni SMS gateway s vlastitim Android telefonom.
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-for="f in features" :key="f.title" cols="12" sm="6" md="4">
            <v-card outlined class="feature-card pa-6 fill-height" flat>
              <v-icon size="36" :color="f.iconColor">{{ f.icon }}</v-icon>
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
    <section class="quick-start py-12 grey lighten-5">
      <v-container>
        <v-row justify="center" class="mb-8">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-h3 font-weight-black primary--text">Brz početak</h2>
            <p class="subtitle-1 text--secondary mt-3 mb-0">
              Tri koraka do prvog SMS-a poslanog kroz HTTP API.
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <div class="step">
              <div class="step-num">1</div>
              <h3 class="text-h6 font-weight-bold mt-3 mb-1 primary--text">
                Instalirajte Android aplikaciju
              </h3>
              <p class="body-2 text--secondary mb-0">
                Preuzmite zadnji APK s
                <a
                  href="https://github.com/domovinatv/sms.domovina.ai/releases"
                  class="text-decoration-none primary--text font-weight-bold"
                  >GitHub Releases</a
                >
                stranice. Radi na Android 8+ s direktnim pristupom SIM kartici.
              </p>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="step">
              <div class="step-num">2</div>
              <h3 class="text-h6 font-weight-bold mt-3 mb-1 primary--text">
                Generirajte API key
              </h3>
              <p class="body-2 text--secondary mb-0">
                Prijavite se i u
                <nuxt-link
                  :to="{ name: 'phone-api-keys' }"
                  class="text-decoration-none primary--text font-weight-bold"
                  >Phone API Keys</nuxt-link
                >
                kreirajte ključ. Unesite ga u Android app — telefon je sad
                spojen.
              </p>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="step">
              <div class="step-num">3</div>
              <h3 class="text-h6 font-weight-bold mt-3 mb-1 primary--text">
                Pošaljite SMS preko HTTP-a
              </h3>
              <p class="body-2 text--secondary mb-0">
                <code>POST /v1/messages/send</code> s
                <code>from</code>, <code>to</code>, <code>content</code>.
                Odgovor stiže u milisekundama; SMS izlazi s vašeg telefona.
              </p>
            </div>
          </v-col>
        </v-row>
        <v-row class="mt-6">
          <v-col cols="12" md="10" offset-md="1">
            <v-card outlined>
              <v-card-text class="pa-0">
                <pre class="snippet"><code>curl --location 'https://sms-api.domovina.ai/v1/messages/send' \
  --header 'x-api-key: YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "from": "+385998710482",
    "to": "+385991234567",
    "content": "Pozdrav iz Domovina SMS-a!"
  }'</code></pre>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Closing CTA -->
    <section class="closing py-16">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-h3 font-weight-black primary--text">
              Spremni za vlastiti SMS gateway?
            </h2>
            <p class="subtitle-1 text--secondary mt-3 mb-6">
              Besplatno, otvorenog koda, neovisno o trećim stranama.
            </p>
            <v-btn color="primary" x-large :to="{ name: 'login' }" class="px-8">
              Započni besplatno
              <v-icon right>{{ mdiArrowRight }}</v-icon>
            </v-btn>
          </v-col>
        </v-row>
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
          title: 'Webhooks za dolazne poruke',
          body: 'Konfigurirajte webhook URL i primajte realtime obavijesti o svakoj dolaznoj poruci, sa HMAC potpisom.',
        },
        {
          icon: mdiKeyChainVariant,
          iconColor: 'primary',
          title: 'Više telefona, više brojeva',
          body: 'Spojite N Android uređaja s različitim SIM karticama. Sustav balansira opterećenje i nudi failover.',
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
          title: 'Zakazane i bulk poruke',
          body: 'Pošaljite poruku u budućnosti, ili pošaljite tisuće poruka iz CSV/XLSX datoteke kroz GUI.',
        },
        {
          icon: mdiHomeHeart,
          iconColor: 'accent',
          title: 'Self-hosted i open source',
          body: 'Otvoreni izvor pod MIT licencom. Cijeli stack pod vašom kontrolom — od Android aplikacije do API-ja i web sučelja.',
        },
      ],
    }
  },
})
</script>

<style lang="scss" scoped>
.domovina-landing {
  background: #ffffff;
}

.hero {
  position: relative;
  background:
    radial-gradient(
      ellipse at top right,
      rgba(0, 47, 108, 0.04) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse at bottom left,
      rgba(255, 0, 0, 0.03) 0%,
      transparent 60%
    );
}

.hero-title {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: #002f6c;
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.1rem;
  }
}

.hero-lede {
  font-size: 1.15rem;
  line-height: 1.6;
  color: #5a6570;
  max-width: 36rem;
}

.tricolor-stripe-thin {
  height: 4px;
  background: linear-gradient(
    to right,
    #ff0000 0%,
    #ff0000 33.33%,
    #ffffff 33.33%,
    #ffffff 66.66%,
    #002f6c 66.66%,
    #002f6c 100%
  );
}

.feature-card {
  border-color: #e1e5ea !important;
  transition: border-color 0.15s, transform 0.15s;
  &:hover {
    border-color: #002f6c !important;
    transform: translateY(-2px);
  }
}

.step {
  position: relative;
  padding-left: 0;
}
.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #002f6c;
  color: #ffffff;
  font-weight: 800;
  font-size: 1.2rem;
}

.snippet {
  margin: 0;
  padding: 1.25rem 1.5rem;
  background: #002f6c;
  color: #e6edf3;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
}
</style>
