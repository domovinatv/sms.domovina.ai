<template>
  <v-container
    fluid
    class="px-0 pt-0"
    :fill-height="$vuetify.breakpoint.lgAndUp"
  >
    <div class="w-full h-full">
      <v-app-bar height="60" :dense="$vuetify.breakpoint.mdAndDown">
        <v-btn icon to="/threads">
          <v-icon>{{ mdiArrowLeft }}</v-icon>
        </v-btn>
        <v-toolbar-title>
          <div class="py-16">Pretraga poruka</div>
        </v-toolbar-title>
        <v-progress-linear
          :active="loading"
          :indeterminate="loading"
          absolute
          bottom
        ></v-progress-linear>
      </v-app-bar>
      <v-container>
        <v-row>
          <v-col cols="12">
            <h5 class="text-h4 mb-3 mt-3">Pretraga poruka</h5>
            <p>
              Na ovoj stranici možete pretraživati sve svoje poruke po broju
              telefona, vrsti poruke i statusu poruke, pa čak i prema sadržaju
              SMS poruke. Možete također skupno brisati poruke i izvoziti svoje
              poruke u CSV datoteku.
            </p>
            <v-alert v-if="errorTitle" text prominent type="warning">
              <h6 class="subtitle-1 font-weight-bold">{{ errorTitle }}</h6>
            </v-alert>
          </v-col>
        </v-row>
        <v-card>
          <v-card-text class="pt-4 pb-0">
            <v-row>
              <v-col cols="4">
                <v-select
                  v-model="formOwners"
                  :error="errorMessages.has('owners')"
                  :error-messages="errorMessages.get('owners')"
                  :items="phoneNumberSelectItems"
                  multiple
                  dense
                  label="Brojevi telefona"
                  outlined
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="formTypes"
                  :error="errorMessages.has('types')"
                  :error-messages="errorMessages.get('types')"
                  :items="messageTypeSelectItems"
                  dense
                  multiple
                  label="Vrste poruka"
                  outlined
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="formStatuses"
                  :error="errorMessages.has('statuses')"
                  :error-messages="errorMessages.get('statuses')"
                  :items="messageStatusSelectItems"
                  dense
                  multiple
                  label="Status poruke"
                  outlined
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mt-n3">
              <v-col cols="8">
                <v-text-field
                  v-model="formQuery"
                  :error="errorMessages.has('query')"
                  :error-messages="errorMessages.get('query')"
                  label="Pojam pretrage"
                  outlined
                  dense
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <div id="cloudflare-turnstile" class="d-none"></div>
                <v-btn
                  :loading="loading"
                  :disabled="loading"
                  color="primary"
                  class="py-5"
                  @click="fetchMessages(true)"
                >
                  <v-icon left>{{ mdiMagnify }}</v-icon>
                  Pretraži poruke
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-row>
          <v-col cols="12" class="mt-16 mb-n2 d-flex">
            <h2 class="text-h4">Rezultati pretrage</h2>
            <v-dialog
              v-model="showDeleteDialog"
              overlay-opacity="0.9"
              max-width="550"
            >
              <template #activator="{ on, attrs }">
                <v-btn
                  :loading="loading"
                  :disabled="loading || selectedMessages.length < 1"
                  small
                  class="ml-2 mt-2"
                  color="error"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon left>{{ mdiDelete }}</v-icon>
                  Obriši poruke
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="text-h5 text-break">
                  Jeste li sigurni da želite obrisati
                  {{ selectedMessages.length }} odabranih poruka?
                </v-card-title>
                <v-card-text>
                  Poruke će biti trajno obrisane s Domovina SMS poslužitelja i
                  neće se moći vratiti.
                </v-card-text>
                <v-card-actions class="pb-4">
                  <v-btn
                    color="primary"
                    :loading="loading"
                    @click="deleteMessages"
                  >
                    <v-icon left>{{ mdiDelete }}</v-icon>
                    Da, obriši poruke
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn text @click="showDeleteDialog = false"> Zatvori </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-spacer></v-spacer>
            <v-btn
              :loading="loading"
              :disabled="loading || selectedMessages.length < 1"
              small
              color="primary"
              class="mt-2"
              @click="exportMessages"
            >
              <v-icon left>{{ mdiExport }}</v-icon>
              Izvezi u CSV
            </v-btn>
          </v-col>
          <v-col cols="12">
            <v-data-table
              v-model="selectedMessages"
              item-key="id"
              :headers="headers"
              :items="messages"
              :items-per-page="100"
              :options.sync="options"
              :server-items-length="totalMessages"
              :loading="loading"
              :footer-props="footerProps"
              show-select
              loading-text="Učitavanje... molimo pričekajte"
              no-data-text="Još nemate nijednu poruku"
              class="elevation-1"
            >
              <template #[`item.created_at`]="props">
                {{ props.item.created_at | timestamp }}
              </template>
              <template #[`item.owner`]="props">
                {{ props.item.owner }}
              </template>
              <template #[`item.contact`]="props">
                {{ props.item.contact }}
              </template>
              <template #[`item.type`]="props">
                <span v-if="props.item.type === 'call/missed'">
                  <v-icon small color="error">{{ mdiCallMissed }}</v-icon>
                  propušten poziv
                </span>
                <span v-if="props.item.type === 'mobile-originated'">
                  <v-icon small>{{ mdiCallReceived }}</v-icon>
                  dolazna
                </span>
                <span v-if="props.item.type === 'mobile-terminated'">
                  <v-icon small color="secondary">{{ mdiCallMade }}</v-icon>
                  odlazna
                </span>
              </template>
              <template #[`item.status`]="props">
                <v-chip
                  v-if="props.item.status === 'expired'"
                  color="warning"
                  small
                  outlined
                >
                  <v-icon small left>{{ mdiAlert }}</v-icon>
                  Isteklo
                </v-chip>

                <v-chip
                  v-else-if="props.item.status === 'delivered'"
                  color="primary"
                  small
                  outlined
                >
                  <v-icon small left>{{ mdiCheckAll }}</v-icon>
                  Dostavljeno
                </v-chip>

                <v-chip
                  v-else-if="props.item.status === 'received'"
                  color="success"
                  small
                  outlined
                >
                  <v-icon small left>{{ mdiCheckAll }}</v-icon>
                  Primljeno
                </v-chip>

                <v-chip v-else-if="props.item.status === 'sent'" small outlined>
                  <v-icon small left>{{ mdiCheck }}</v-icon>
                  Poslano
                </v-chip>

                <v-chip
                  v-else-if="props.item.status === 'failed'"
                  color="error"
                  small
                  outlined
                >
                  <v-icon small left>{{ mdiAlert }}</v-icon>
                  Neuspjelo
                </v-chip>

                <v-chip v-else small color="cyan" outlined>
                  <v-icon small left>{{ mdiProgressCheck }}</v-icon>
                  {{ props.item.status | capitalize }}
                </v-chip>
              </template>
              <template #[`item.content`]="props">
                <pre
                  style="
                    white-space: pre-wrap;
                    max-width: 300px;
                    word-break: break-all;
                  "
                  >{{ props.item.content }}</pre
                >
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  mdiDelete,
  mdiMagnify,
  mdiArrowLeft,
  mdiCheckAll,
  mdiCheck,
  mdiCallMissed,
  mdiCallReceived,
  mdiCallMade,
  mdiExport,
  mdiProgressCheck,
  mdiAlert,
} from '@mdi/js'
import { AxiosError } from 'axios'
import { DataOptions } from 'vuetify'
import { ErrorMessages, getErrorMessages } from '~/plugins/errors'
import capitalize from '~/plugins/capitalize'
import {
  EntitiesMessage,
  EntitiesPhone,
  ResponsesUnprocessableEntity,
} from '~/models/api'
import { formatPhoneNumber } from '~/plugins/filters'
import { SearchMessagesRequest } from '~/models/message'

interface Turnstile {
  ready(callback: () => void): void
  render(
    container: string | HTMLElement,
    params?: {
      sitekey: string
      action: string
      callback?: (token: string) => void
      'error-callback'?: ((error: string) => void) | undefined
    },
  ): string | null | undefined
}

export default Vue.extend({
  name: 'SearchMessagesIndex',
  middleware: ['auth'],
  data() {
    return {
      mdiDelete,
      mdiMagnify,
      mdiArrowLeft,
      mdiExport,
      mdiAlert,
      mdiCheck,
      mdiCheckAll,
      mdiCallMissed,
      mdiCallReceived,
      mdiCallMade,
      mdiProgressCheck,
      loading: true,
      errorTitle: '',
      showDeleteDialog: false,
      selectedMessages: [] as EntitiesMessage[],
      errorMessages: new ErrorMessages(),
      formOwners: [],
      formTypes: [],
      formStatuses: [],
      formQuery: '',
      footerProps: {
        itemsPerPage: 100,
        itemsPerPageOptions: [10, 50, 100, 200],
      },
      options: {
        sortBy: ['created_at'],
        sortDesc: [true],
      } as DataOptions,
      messages: [] as EntitiesMessage[],
      totalMessages: -1,
      headers: [
        { text: 'Stvoreno', value: 'created_at' },
        { text: 'Vlasnik', value: 'owner' },
        { text: 'Kontakt', value: 'contact' },
        { text: 'Vrsta poruke', value: 'type' },
        { text: 'Status', value: 'status' },
        { text: 'Sadržaj poruke', value: 'content', sortable: false },
      ],
    }
  },
  head() {
    return {
      title: 'Pretraga poruka — Domovina SMS',
    }
  },
  computed: {
    phoneNumberSelectItems() {
      return this.$store.getters.getPhones.map((phone: EntitiesPhone) => {
        return {
          text: formatPhoneNumber(phone.phone_number),
          value: phone.phone_number,
        }
      })
    },
    messageTypeSelectItems() {
      return [
        { text: 'Odlazne', value: 'mobile-terminated' },
        { text: 'Dolazne', value: 'mobile-originated' },
        { text: 'Propušteni pozivi', value: 'call/missed' },
      ]
    },
    messageStatusSelectItems() {
      return [
        { value: 'pending', text: 'U tijeku' },
        { value: 'sent', text: 'Poslano' },
        { value: 'delivered', text: 'Dostavljeno' },
        { value: 'failed', text: 'Neuspjelo' },
        { value: 'expired', text: 'Isteklo' },
        { value: 'received', text: 'Primljeno' },
      ]
    },
  },
  watch: {
    options: {
      handler() {
        this.fetchMessages()
      },
      deep: true,
    },
  },
  async mounted() {
    await this.$store.dispatch('loadUser')
    await this.$store.dispatch('loadPhones')
    this.loading = false
  },

  methods: {
    getCaptcha(): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        const turnstile = (window as any).turnstile as Turnstile
        turnstile.ready(() => {
          turnstile.render('#cloudflare-turnstile', {
            sitekey: this.$config.cloudflareTurnstileSiteKey,
            callback: (token) => {
              resolve(token)
            },
            action: 'search_messages',
            'error-callback': (error: string) => {
              reject(error)
            },
          })
        })
      })
    },
    exportMessages() {
      let csvContent = 'data:text/csv;charset=utf-8,'
      csvContent +=
        'ID poruke,Stvoreno,Vlasnik,Kontakt,Vrsta poruke,Status,Sadržaj poruke\n'
      this.selectedMessages.forEach((message) => {
        csvContent += `${message.id},${new Date(
          message.created_at,
        ).toLocaleString()},${message.owner},${message.contact},${
          message.type
        },${message.status},${this.sanitizeContent(message.content)}\n`
      })

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute(
        'download',
        `domovina-sms-${new Date().toJSON().slice(0, 10)}.csv`,
      )
      document.body.appendChild(link) // Required for FF

      link.click()

      this.$store.dispatch('addNotification', {
        message: 'Odabrane poruke uspješno su izvezene',
        type: 'success',
      })
    },

    sanitizeContent(content: string): string {
      content = content.replaceAll('"', '""')
      return content.includes(',') ? '"' + content + '"' : content
    },

    deleteMessages() {
      this.loading = true
      Promise.all(
        this.selectedMessages.map((message) =>
          this.$store.dispatch('deleteMessage', message.id),
        ),
      )
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Odabrane poruke uspješno su obrisane',
            type: 'success',
          })
          this.selectedMessages = []
        })
        .catch(() => {
          this.$store.dispatch('addNotification', {
            message: 'Pogreška prilikom brisanja odabranih poruka',
            type: 'error',
          })
        })
        .finally(() => {
          this.loading = false
          this.showDeleteDialog = false
          this.fetchMessages()
        })
    },

    fetchMessages(reset = false) {
      this.loading = true
      this.errorMessages = new ErrorMessages()
      this.errorTitle = ''

      if (reset) {
        this.options.page = 1
      }

      this.getCaptcha()
        .then((token: string) => {
          this.$store
            .dispatch('searchMessages', {
              token,
              owners: this.formOwners,
              types: this.formTypes,
              statuses: this.formStatuses,
              query: this.formQuery,
              sort_by: this.options.sortBy[0],
              sort_descending: this.options.sortDesc[0],
              skip: (this.options.page - 1) * this.options.itemsPerPage,
              limit: this.options.itemsPerPage,
            } as SearchMessagesRequest)
            .then((messages: EntitiesMessage[]) => {
              this.messages = messages
              this.totalMessages =
                (this.options.page - 1) * this.options.itemsPerPage +
                messages.length
              if (messages.length === this.options.itemsPerPage) {
                this.totalMessages = this.totalMessages + 1
              }
            })
            .catch((error: AxiosError<ResponsesUnprocessableEntity>) => {
              this.errorTitle = capitalize(
                error.response?.data?.message ??
                  'Pogreška prilikom pretrage poruka',
              )
              this.errorMessages = getErrorMessages(error)
            })
            .finally(() => {
              this.loading = false
            })
        })
        .catch((error: string) => {
          this.errorTitle = error
          this.loading = false
        })
    },
  },
})
</script>
