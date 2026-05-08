<template>
  <v-app-bar elevation="0" color="white" height="70" fixed light flat class="brand-fixed-header">
    <v-container>
      <v-row>
        <v-col class="w-full d-flex align-center">
          <nuxt-link
            :to="{ name: 'index' }"
            class="text-decoration-none d-flex align-center"
          >
            <v-avatar tile size="36">
              <v-img contain :src="require('@/assets/img/logo.svg')"></v-img>
            </v-avatar>
            <span v-if="$vuetify.breakpoint.smAndUp" class="brand-wordmark ml-2">
              <span class="brand-name">DOMOVINA</span><span class="brand-tld">.ai</span>
              <span class="brand-sub">SMS</span>
            </span>
          </nuxt-link>
          <v-spacer></v-spacer>
          <v-btn
            exact-path
            color="primary"
            class="mt-3"
            :large="$vuetify.breakpoint.lgAndUp"
            :to="{ name: 'login' }"
          >
            Započni
            <span v-if="$vuetify.breakpoint.lgAndUp">&nbsp;besplatno</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<style lang="scss" scoped>
.brand-fixed-header {
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
</style>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
@Component
export default class FixedHeader extends Vue {}
</script>
