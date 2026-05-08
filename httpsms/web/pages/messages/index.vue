<template>
  <v-container fluid class="pa-0" :fill-height="$vuetify.breakpoint.lgAndUp">
    <div class="w-full h-full">
      <v-app-bar height="60" :dense="$vuetify.breakpoint.mdAndDown" fixed>
        <v-btn icon to="/threads">
          <v-icon>{{ mdiArrowLeft }}</v-icon>
        </v-btn>
        <v-toolbar-title
          >Nova poruka
          <v-icon x-small class="mx-2" color="primary">{{ mdiCircle }}</v-icon>
          {{ $store.getters.getOwner | phoneNumber }}</v-toolbar-title
        >
      </v-app-bar>
      <v-container class="mt-16">
        <v-row>
          <v-col cols="12" md="8" offset-md="2" xl="6" offset-xl="3">
            <v-form @submit.prevent="sendMessage">
              <v-text-field
                persistent-placeholder
                v-model="formPhoneNumber"
                :disabled="sending"
                :error="errors.has('to')"
                :error-messages="errors.get('to')"
                outlined
                placeholder="Broj telefona primatelja, npr. +385912345678"
                label="Broj telefona"
              ></v-text-field>
              <v-textarea
                persistent-placeholder
                v-model="formContent"
                :error="errors.has('content')"
                :error-messages="errors.get('content')"
                :disabled="sending"
                outlined
                placeholder="Upišite poruku ovdje"
                label="Sadržaj"
              ></v-textarea>
              <v-textarea
                persistent-placeholder
                persistent-hint
                v-model="formAttachments"
                :error="errors.has('attachments')"
                :error-messages="errors.get('attachments')"
                :disabled="sending"
                outlined
                rows="2"
                class="mb-8"
                hint="Poruka će biti poslana kao MMS kada je naveden popis URL-ova privitaka odvojenih zarezima"
                placeholder="https://example.com/image.jpg, https://example.com/video.mp4"
                label="URL-ovi privitaka (neobavezno)"
              ></v-textarea>
              <v-btn
                type="submit"
                class="primary"
                :disabled="sending"
                :block="$vuetify.breakpoint.mdAndDown"
              >
                <v-icon>{{ mdiSend }}</v-icon>
                Pošalji poruku
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>

<script>
import { mdiArrowLeft, mdiSend, mdiSim, mdiCircle } from '@mdi/js'
import axios from '@/plugins/axios'

export default {
  name: 'MessagesIndex',
  middleware: ['auth'],
  data() {
    return {
      mdiArrowLeft,
      mdiSend,
      mdiCircle,
      mdiSim,
      simOptions: [
        { title: 'Zadano', code: 'DEFAULT' },
        { title: 'SIM 1', code: 'SIM1' },
        { title: 'SIM 2', code: 'SIM2' },
      ],
      simSelected: { title: 'Zadano', code: 'DEFAULT' },
      sending: false,
      formPhoneNumber: '',
      formContent: '',
      formAttachments: '',
      errors: new Map(),
    }
  },
  head() {
    return {
      title: 'Nova poruka — Domovina SMS',
    }
  },

  methods: {
    sendMessage() {
      this.errors = new Map()
      this.sending = true

      axios
        .post('/v1/messages/send', {
          to: this.formPhoneNumber,
          from: this.$store.getters.getOwner,
          content: this.formContent,
          attachments: this.formAttachments
            .trim()
            .split(',')
            .filter((x) => x.trim() !== '')
            .map((x) => x.trim()),
          sim: this.simSelected.code,
        })
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Poruka poslana!',
            type: 'success',
          })
          this.$router.push({ name: 'threads' })
        })
        .catch((axiosError) => {
          const errors = new Map()
          const response = axiosError.response
          if (response.data.data.content) {
            errors.set('content', response.data.data.content)
          }
          if (response.data.data.to) {
            errors.set(
              'to',
              response.data.data.to.map((x) =>
                x.replace('to field', 'polje broja telefona'),
              ),
            )
          }
          if (response.data.data.attachments) {
            errors.set('attachments', response.data.data.attachments)
          }
          if (response.data.data.from) {
            this.$store.dispatch('addNotification', {
              message: response.data.data.from[0],
              type: 'error',
            })
          }
          this.errors = errors
        })
        .finally(() => {
          this.sending = false
        })
    },
  },
}
</script>
