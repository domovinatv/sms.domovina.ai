<template>
  <v-app>
    <v-main>
      <v-container fill-height>
        <v-row align="center" justify="center">
          <v-col cols="12" md="6" class="text-center">
            <v-img
              :src="require('@/assets/img/logo.svg')"
              max-width="120"
              class="mx-auto mb-6"
              contain
            />
            <h1 class="text-h3 font-weight-black primary--text">
              {{ title }}
            </h1>
            <p class="subtitle-1 text--secondary mt-3 mb-6">
              {{ subtitle }}
            </p>
            <v-btn color="primary" large to="/">
              Povratak na početnu
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'ErrorLayout',
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  computed: {
    title() {
      return this.error.statusCode === 404
        ? '404 — Stranica nije pronađena'
        : 'Dogodila se greška'
    },
    subtitle() {
      return this.error.statusCode === 404
        ? 'Stranica koju tražite ne postoji ili je premještena.'
        : 'Pokušajte ponovno ili se obratite podršci ako se problem nastavi.'
    },
  },
  head() {
    return { title: this.title }
  },
}
</script>
