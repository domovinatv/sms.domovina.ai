<template>
  <v-app>
    <v-app-bar
      app
      elevate-on-scroll
      color="white"
      :height="$vuetify.breakpoint.xsOnly ? 60 : 72"
      light
      flat
      class="brand-app-bar"
    >
      <div class="brand-app-bar__inner d-flex align-center w-full">
        <nuxt-link
          to="/"
          class="text-decoration-none d-flex align-center brand-link"
          aria-label="Domovina SMS — početna"
        >
          <v-avatar
            tile
            :size="$vuetify.breakpoint.xsOnly ? 36 : 44"
            class="brand-link__logo"
          >
            <v-img contain :src="require('@/assets/img/logo.svg')"></v-img>
          </v-avatar>
          <span class="brand-wordmark ml-2">
            <span class="brand-name">DOMOVINA</span><span class="brand-tld">.ai</span><span class="brand-sub">SMS</span>
          </span>
        </nuxt-link>
        <v-spacer></v-spacer>
        <v-btn
          v-if="$vuetify.breakpoint.mdAndUp && $store.getters.getAuthUser === null"
          text
          color="primary"
          class="mr-2"
          :to="{ name: 'login' }"
        >
          Prijava
        </v-btn>
        <v-btn
          v-if="$store.getters.getAuthUser === null"
          color="primary"
          depressed
          :small="$vuetify.breakpoint.xsOnly"
          :to="{ name: 'login' }"
        >
          Započni
          <span v-show="$vuetify.breakpoint.smAndUp">&nbsp;besplatno</span>
        </v-btn>
        <v-btn
          v-if="$store.getters.getAuthUser !== null"
          color="primary"
          depressed
          :small="$vuetify.breakpoint.xsOnly"
          :to="{ name: 'threads' }"
        >
          Dashboard
        </v-btn>
      </div>
    </v-app-bar>
    <v-main>
      <toast></toast>
      <Nuxt />
    </v-main>
    <v-footer class="pt-8 pb-4" color="grey lighten-5" light>
      <v-container>
        <v-row>
          <v-col cols="12" md="3">
            <nuxt-link to="/" class="text-decoration-none d-flex align-center">
              <v-avatar tile size="36">
                <v-img contain :src="require('@/assets/img/logo.svg')"></v-img>
              </v-avatar>
              <h3 class="brand-wordmark ml-2">
                <span class="brand-name">DOMOVINA</span><span class="brand-tld">.ai</span>
                <span class="brand-sub">SMS</span>
              </h3>
            </nuxt-link>
            <p class="subtitle-2 text--secondary mt-3 mb-2">
              Napravljeno s
              <v-icon small color="#FF0000">{{ mdiHeart }}</v-icon>
              u Hrvatskoj
            </p>
            <p class="caption text--secondary mb-3">
              Dio platforme
              <a
                href="https://domovina.ai"
                class="text--primary text-decoration-none font-weight-bold"
                >DOMOVINA.ai</a
              >.
            </p>
            <v-btn
              href="https://github.com/domovinatv/sms.domovina.ai"
              icon
              color="primary"
              aria-label="GitHub"
            >
              <v-icon>{{ mdiGithub }}</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="6" md="3">
            <h2 class="text-h6 mb-2">Razvoj</h2>
            <ul style="list-style: none" class="pa-0">
              <li class="mb-2">
                <v-hover v-slot="{ hover }">
                  <a
                    href="https://github.com/domovinatv/sms.domovina.ai"
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                  >
                    Dokumentacija
                    <v-icon small>{{ mdiBookOpenVariant }}</v-icon>
                  </a>
                </v-hover>
              </li>
              <li class="mb-2">
                <v-hover v-slot="{ hover }">
                  <a
                    href="https://github.com/domovinatv/sms.domovina.ai"
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                  >
                    GitHub
                    <v-icon small>{{ mdiGithub }}</v-icon>
                  </a>
                </v-hover>
              </li>
              <li class="mb-2">
                <v-hover v-slot="{ hover }">
                  <a
                    href="https://otp.domovina.ai"
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                  >
                    Provjera broja (OTP)
                    <v-icon small color="accent">{{ mdiShieldCheckOutline }}</v-icon>
                  </a>
                </v-hover>
              </li>
            </ul>
          </v-col>
          <v-col cols="6" md="3">
            <h2 class="text-h6 mb-2">Kontakt</h2>
            <p class="body-2 mb-1 font-weight-bold">Matija Stepanić</p>
            <p class="caption text--secondary mb-3">
              CEO,
              <a
                href="https://italk.hr"
                target="_blank"
                rel="noopener"
                class="text--primary text-decoration-none font-weight-bold"
                >ITalk d.o.o.</a
              >
            </p>
            <ul style="list-style: none" class="pa-0">
              <li class="mb-2">
                <v-hover v-slot="{ hover }">
                  <a
                    href="https://www.linkedin.com/in/stepanic/"
                    target="_blank"
                    rel="noopener"
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                  >
                    LinkedIn
                    <v-icon small>{{ mdiLinkedin }}</v-icon>
                  </a>
                </v-hover>
              </li>
              <li class="mb-2">
                <v-hover v-slot="{ hover }">
                  <a
                    href="tel:+385989679022"
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                  >
                    +385 98 967 9022
                    <v-icon small>{{ mdiPhone }}</v-icon>
                  </a>
                </v-hover>
              </li>
              <li class="mb-2">
                <v-hover v-slot="{ hover }">
                  <a
                    href="mailto:support@domovina.ai"
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                  >
                    support@domovina.ai
                    <v-icon small>{{ mdiEmailOutline }}</v-icon>
                  </a>
                </v-hover>
              </li>
            </ul>
          </v-col>
          <v-col cols="6" md="3">
            <h2 class="text-h6 mb-2">Pravno</h2>
            <ul style="list-style: none" class="pa-0">
              <li class="mb-2">
                <v-hover v-slot="{ hover }">
                  <nuxt-link
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                    to="/terms-and-conditions"
                  >
                    Uvjeti korištenja
                    <v-icon small>{{ mdiScaleBalance }}</v-icon>
                  </nuxt-link>
                </v-hover>
              </li>
              <li class="mb-2">
                <v-hover v-slot="{ hover }">
                  <nuxt-link
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                    to="/privacy-policy"
                  >
                    Politika privatnosti
                    <v-icon small>{{ mdiEyeOffOutline }}</v-icon>
                  </nuxt-link>
                </v-hover>
              </li>
            </ul>
          </v-col>
        </v-row>
        <v-divider class="my-6"></v-divider>
        <v-row>
          <v-col cols="12" md="8">
            <p class="caption text--secondary mb-1">
              &copy; {{ year }}
              <a
                href="https://italk.hr"
                target="_blank"
                rel="noopener"
                class="text--primary text-decoration-none font-weight-bold"
                >ITalk d.o.o.</a
              >
              &mdash; Domovina SMS, samostalno hostani SMS gateway za Hrvatsku.
            </p>
            <p class="caption text--secondary mb-0">
              Temeljen na otvorenom projektu
              <a
                href="https://github.com/NdoleStudio/httpsms"
                target="_blank"
                rel="noopener"
                class="text--primary text-decoration-none font-weight-bold"
                >httpSMS by NdoleStudio</a
              >
              (AGPL-3.0). Hvala kreatoru na izvornom kodu.
            </p>
          </v-col>
          <v-col cols="12" md="4" class="text-md-right">
            <p class="caption text--secondary mb-0">
              Verzija
              <code class="caption">main</code>
              &middot; Status:
              <span class="success--text font-weight-bold">aktivno</span>
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
    <v-divider class="tricolor-stripe" />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  mdiGithub,
  mdiHeart,
  mdiEyeOffOutline,
  mdiScaleBalance,
  mdiEmailOutline,
  mdiBookOpenVariant,
  mdiShieldCheckOutline,
  mdiLinkedin,
  mdiPhone,
} from '@mdi/js'

export default Vue.extend({
  name: 'WebsiteLayout',
  data() {
    return {
      mdiGithub,
      mdiHeart,
      mdiScaleBalance,
      mdiEyeOffOutline,
      mdiEmailOutline,
      mdiBookOpenVariant,
      mdiShieldCheckOutline,
      mdiLinkedin,
      mdiPhone,
      year: new Date().getFullYear(),
    }
  },
})
</script>

<style lang="scss">
.v-application {
  .brand-app-bar {
    border-bottom: 1px solid #e1e5ea !important;
    // Croatian tricolour shows as a 3px accent on the bottom of the header
    // — replaces the old separate <v-divider> stripe so the header reads
    // as one unified element on all viewports.
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      background: linear-gradient(
        to right,
        #ff0000 0%,
        #ff0000 33.33%,
        #ffffff 33.33%,
        #ffffff 66.66%,
        #002f6c 66.66%,
        #002f6c 100%
      );
      pointer-events: none;
    }
    .v-toolbar__content {
      padding: 0 1rem;
    }
  }
  .brand-app-bar__inner {
    max-width: 1180px;
    margin: 0 auto;
    width: 100%;
  }
  .brand-link {
    min-width: 0; // allow truncation in flex
    flex-shrink: 1;
  }
  .brand-wordmark {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    line-height: 1;
    display: inline-flex;
    align-items: baseline;
    white-space: nowrap;
    .brand-name {
      color: #002f6c;
    }
    .brand-tld {
      color: #ff0000;
    }
    .brand-sub {
      color: #5a6570;
      font-size: 0.65rem;
      font-weight: 700;
      margin-left: 0.45rem;
      letter-spacing: 0.14em;
      padding: 2px 6px;
      border: 1px solid #e1e5ea;
      border-radius: 3px;
      align-self: center;
    }
  }
  @media (max-width: 360px) {
    .brand-wordmark {
      font-size: 0.9rem;
      .brand-sub {
        display: none; // very narrow phones — drop the SMS badge
      }
    }
  }
  .tricolor-stripe {
    height: 6px;
    background: linear-gradient(
      to right,
      #ff0000 0%,
      #ff0000 33.33%,
      #ffffff 33.33%,
      #ffffff 66.66%,
      #002f6c 66.66%,
      #002f6c 100%
    );
    border: 0;
  }
}
</style>
