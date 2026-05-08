<template>
  <v-app>
    <v-divider class="tricolor-stripe" />
    <v-app-bar
      elevate-on-scroll
      color="white"
      height="70"
      fixed
      light
      flat
      class="brand-app-bar"
    >
      <v-container>
        <v-row>
          <v-col class="w-full d-flex align-center">
            <nuxt-link
              to="/"
              class="text-decoration-none d-flex align-center"
            >
              <v-avatar tile size="40">
                <v-img contain :src="require('@/assets/img/logo.svg')"></v-img>
              </v-avatar>
              <h3
                v-if="$vuetify.breakpoint.smAndUp"
                class="brand-wordmark ml-2"
              >
                <span class="brand-name">DOMOVINA</span><span class="brand-tld">.ai</span>
                <span class="brand-sub">SMS</span>
              </h3>
            </nuxt-link>
            <v-spacer></v-spacer>
            <v-btn
              v-show="
                $vuetify.breakpoint.lgAndUp &&
                $store.getters.getAuthUser === null
              "
              large
              text
              color="primary"
              class="my-5 mr-2"
              :to="{ name: 'login' }"
            >
              Prijava
            </v-btn>
            <v-btn
              v-show="$store.getters.getAuthUser === null"
              exact-path
              color="primary"
              :class="{
                'mt-5': $vuetify.breakpoint.mdAndUp,
                'mt-1': !$vuetify.breakpoint.mdAndUp,
              }"
              :large="$vuetify.breakpoint.lgAndUp"
              :to="{ name: 'login' }"
            >
              Započni
              <span v-show="$vuetify.breakpoint.lgAndUp">&nbsp;besplatno</span>
            </v-btn>
            <v-btn
              v-show="$store.getters.getAuthUser !== null"
              exact-path
              color="primary"
              :class="{
                'mt-5': $vuetify.breakpoint.mdAndUp,
                'mt-1': !$vuetify.breakpoint.mdAndUp,
              }"
              :large="$vuetify.breakpoint.lgAndUp"
              :to="{ name: 'threads' }"
            >
              Dashboard
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <v-main>
      <toast></toast>
      <Nuxt />
    </v-main>
    <v-footer class="pt-8 pb-4" color="grey lighten-5" light>
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
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
          <v-col cols="6" md="4">
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
          <v-col cols="6" md="4">
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
              <li class="mt-2">
                <v-hover v-slot="{ hover }">
                  <a
                    class="text--primary text-decoration-none"
                    :class="{ 'text-decoration-underline': hover }"
                    href="mailto:support@domovina.ai"
                  >
                    Podrška
                    <v-icon small>{{ mdiEmailOutline }}</v-icon>
                  </a>
                </v-hover>
              </li>
            </ul>
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
    }
  },
})
</script>

<style lang="scss">
.v-application {
  .brand-app-bar {
    border-bottom: 1px solid #e1e5ea;
  }
  .brand-wordmark {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    line-height: 1;
    display: inline-flex;
    align-items: baseline;
    .brand-name {
      color: #002f6c;
    }
    .brand-tld {
      color: #ff0000;
    }
    .brand-sub {
      color: #5a6570;
      font-size: 0.7rem;
      font-weight: 700;
      margin-left: 0.5rem;
      letter-spacing: 0.12em;
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
