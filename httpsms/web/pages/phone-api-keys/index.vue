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
          <div class="py-16">API ključevi telefona</div>
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
          <v-col cols="12" md="9" offset-md="1" xl="8" offset-xl="2">
            <div class="d-flex mt-3 mb-4">
              <v-progress-circular
                v-if="loading"
                :size="24"
                :width="2"
                color="primary"
                class="mt-2 mr-2"
                indeterminate
              ></v-progress-circular>
              <h5 class="text-h4">API ključevi telefona</h5>
              <v-btn
                color="primary"
                class="ml-4 mt-1"
                @click="showCreateAPIKeyDialog = true"
              >
                <v-icon left>{{ mdiPlus }}</v-icon>
                Stvori API ključ
              </v-btn>
              <v-dialog
                v-model="showCreateAPIKeyDialog"
                overlay-opacity="0.9"
                max-width="600px"
              >
                <v-card>
                  <v-card-title>Stvori API ključ telefona</v-card-title>
                  <v-card-subtitle class="mt-2"
                    >Nakon stvaranja API ključa možete ga koristiti za prijavu u
                    Domovina SMS Android aplikaciju na svom telefonu</v-card-subtitle
                  >
                  <v-card-text>
                    <v-form>
                      <v-text-field
                        v-model="formPhoneApiKeyName"
                        label="Naziv"
                        placeholder="Unesite naziv za svoj API ključ"
                        name="api-key"
                        outlined
                        :disabled="loading"
                        :error="errorMessages.has('name')"
                        :error-messages="errorMessages.get('name')"
                        persistent-hint
                        class="mb-n2"
                      ></v-text-field>
                    </v-form>
                  </v-card-text>
                  <v-card-actions class="mt-n4">
                    <v-btn
                      color="primary"
                      :loading="loading"
                      @click="createPhoneApiKey"
                      >Stvori ključ</v-btn
                    >
                    <v-spacer />
                    <v-btn
                      color="default"
                      text
                      @click="showCreateAPIKeyDialog = false"
                      >Zatvori</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-spacer />
              <v-btn
                v-if="$vuetify.breakpoint.lgAndUp"
                href="https://github.com/domovinatv/sms.domovina.ai/features/phone-api-keys"
                color="secondary"
                class="mt-1"
                >Dokumentacija</v-btn
              >
            </div>
            <p class="text--secondary">
              Ako imate više telefona, možete stvoriti zasebne API ključeve
              telefona za različite Android uređaje. Ovi API ključevi mogu se
              koristiti samo na određenom mobilnom telefonu kada poziva
              Domovina SMS poslužitelj za određene radnje poput slanja otkucaja,
              registriranja primljenih poruka, izvješća o dostavi itd. Ako želite
              koristiti puni
              <a
                class="text-decoration-none"
                target="_blank"
                href="https://sms-api.domovina.ai"
                >Domovina SMS API</a
              >, umjesto toga koristite API ključ na stranici postavki računa
              <router-link class="text-decoration-none" to="/settings"
                >https://sms.domovina.ai/settings</router-link
              >.
            </p>
            <v-simple-table class="mb-4 api-key-table">
              <template #default>
                <thead>
                  <tr class="text-uppercase subtitle-2">
                    <th class="text-left">Naziv</th>
                    <th class="text-left">Stvoreno</th>
                    <th class="text-left">Brojevi telefona</th>
                    <th class="text-left">Radnje</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="phoneApiKey in phoneApiKeys" :key="phoneApiKey.id">
                    <td class="text-left">
                      {{ phoneApiKey.name }}
                    </td>
                    <td>{{ phoneApiKey.created_at | timestamp }}</td>
                    <td>
                      <ul v-if="phoneApiKey.phone_numbers.length" class="ml-n3">
                        <li
                          v-for="phoneNumber in phoneApiKey.phone_numbers"
                          :key="phoneNumber"
                          class="my-3"
                        >
                          <b>{{ phoneNumber | phoneNumber }}</b>
                          <v-btn
                            class="ml-2 mt-n1"
                            small
                            color="error"
                            @click="
                              showRemovePhoneFromApiKeyDialog(
                                phoneApiKey,
                                phoneNumber,
                              )
                            "
                          >
                            Ukloni
                          </v-btn>
                        </li>
                      </ul>
                      <span v-else class="text--secondary">-</span>
                    </td>
                    <td>
                      <v-btn
                        small
                        color="primary"
                        :disabled="loading"
                        :loading="loading"
                        @click="showPhoneApiKey(phoneApiKey)"
                      >
                        <v-icon left>{{ mdiEye }}</v-icon> Prikaži
                      </v-btn>
                      <v-btn
                        class="ml-2"
                        small
                        :disabled="loading"
                        color="error"
                        @click="showDeletePhoneApiKeyDialog(phoneApiKey)"
                      >
                        <v-icon left>{{ mdiDelete }}</v-icon> Obriši
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <v-dialog
      v-model="showPhoneApiKeyQrCode"
      overlay-opacity="0.9"
      max-width="600"
    >
      <v-card>
        <v-card-title>QR kod API ključa telefona</v-card-title>
        <v-card-subtitle class="mt-2"
          >Skenirajte ovaj QR kod s
          <a
            class="text-decoration-none"
            :href="$store.getters.getAppData.appDownloadUrl"
            >Domovina SMS aplikacijom</a
          >
          na svom Android telefonu za prijavu.</v-card-subtitle
        >
        <v-card-text class="text-center">
          <v-text-field
            :value="activePhoneApiKey?.api_key"
            readonly
            name="api-key"
            outlined
            class="mb-n2"
          ></v-text-field>
          <canvas ref="qrCodeCanvas"></canvas>
        </v-card-text>
        <v-card-actions>
          <copy-button
            :value="activePhoneApiKey?.api_key"
            color="primary"
            copy-text="Kopiraj API ključ"
            notification-text="API ključ telefona uspješno kopiran"
          />
          <v-spacer></v-spacer>
          <v-btn text class="mb-4" @click="showPhoneApiKeyQrCode = false"
            >Zatvori</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteApiKeyDialog"
      overlay-opacity="0.9"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5 text-break">
          Jeste li sigurni da želite obrisati API ključ
          <code>{{ activePhoneApiKey?.name }}</code>?
        </v-card-title>
        <v-card-text>
          Morat ćete se odjaviti i ponovno prijaviti u <b>Domovina SMS</b>
          Android aplikaciju na svim telefonima koji trenutno koriste ovaj API
          ključ.
        </v-card-text>
        <v-card-actions class="pb-4">
          <v-btn color="error" :loading="loading" @click="deleteApiKey">
            <v-icon left>{{ mdiDelete }}</v-icon>
            Obriši API ključ
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteApiKeyDialog = false"> Zatvori </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="removePhoneFromApiKeyDialog"
      overlay-opacity="0.9"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5 text-break">
          Jeste li sigurni da želite ukloniti ovaj broj telefona iz API ključa?
        </v-card-title>
        <v-card-text>
          Ovo će ukloniti
          <code>{{ activePhoneNumber | phoneNumber }}</code> iz vašeg API ključa
          telefona. Morat ćete se odjaviti i ponovno prijaviti u
          <b>Domovina SMS</b> Android aplikaciju na telefonu koji trenutno
          koristi ovaj API ključ.
        </v-card-text>
        <v-card-actions class="pb-4">
          <v-btn
            color="error"
            :loading="loading"
            @click="removePhoneFromPhoneKey"
          >
            <v-icon left>{{ mdiDelete }}</v-icon>
            Ukloni telefon iz ključa
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="removePhoneFromApiKeyDialog = false">
            Zatvori
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import * as QRCode from 'qrcode'
import {
  mdiArrowLeft,
  mdiAccountCircle,
  mdiShieldCheck,
  mdiDelete,
  mdiInformation,
  mdiPlus,
  mdiContentSave,
  mdiMicrosoftExcel,
  mdiEye,
  mdiEyeOff,
  mdiSendCheck,
  mdiCallReceived,
  mdiCallMade,
  mdiDotsVertical,
  mdiCreditCard,
  mdiSquareEditOutline,
} from '@mdi/js'
import Pusher, { Channel } from 'pusher-js'
import { AxiosError } from 'axios'
import { ErrorMessages, getErrorMessages } from '~/plugins/errors'
import {
  EntitiesPhone,
  EntitiesPhoneAPIKey,
  ResponsesUnprocessableEntity,
} from '~/models/api'

export default Vue.extend({
  name: 'PhoneApiKeysIndex',
  middleware: ['auth'],
  data() {
    return {
      mdiEye,
      mdiPlus,
      mdiEyeOff,
      mdiMicrosoftExcel,
      mdiArrowLeft,
      mdiAccountCircle,
      mdiShieldCheck,
      mdiDelete,
      mdiSendCheck,
      mdiContentSave,
      mdiCallReceived,
      mdiCallMade,
      mdiCreditCard,
      mdiInformation,
      mdiDotsVertical,
      mdiSquareEditOutline,
      formFile: null,
      loading: true,
      errorTitle: '',
      formPhoneApiKeyName: '',
      showPhoneApiKeyQrCode: false,
      errorMessages: new ErrorMessages(),
      phoneApiKeys: new Array<EntitiesPhoneAPIKey>(),
      activePhoneApiKey: null as EntitiesPhoneAPIKey | null,
      activePhoneNumber: '',
      showCreateAPIKeyDialog: false,
      deleteApiKeyDialog: false,
      removePhoneFromApiKeyDialog: false,
      webhookChannel: null as Channel | null,
    }
  },
  head() {
    return {
      title: 'API ključevi telefona — Domovina SMS',
    }
  },
  computed: {},
  async mounted() {
    await this.$store.dispatch('loadUser')
    await this.$store.dispatch('loadPhones')
    this.loadPhoneApiKeys()
    this.loading = false

    const pusher = new Pusher(this.$config.pusherKey, {
      cluster: this.$config.pusherCluster,
    })
    this.webhookChannel = pusher.subscribe(this.$store.getters.getAuthUser.id)
    this.webhookChannel.bind('phone.updated', () => {
      if (!this.loading) {
        this.loadPhoneApiKeys()
      }
    })
  },
  beforeDestroy() {
    if (this.webhookChannel) {
      this.webhookChannel.unsubscribe()
    }
  },
  methods: {
    showPhoneApiKey(apiKey: EntitiesPhoneAPIKey) {
      this.activePhoneApiKey = apiKey
      this.showPhoneApiKeyQrCode = true
      this.$nextTick(() => {
        this.generateQrCode(apiKey.api_key)
      })
    },
    showDeletePhoneApiKeyDialog(apiKey: EntitiesPhoneAPIKey) {
      this.activePhoneApiKey = apiKey
      this.deleteApiKeyDialog = true
    },
    showRemovePhoneFromApiKeyDialog(
      apiKey: EntitiesPhoneAPIKey,
      phoneNumber: string,
    ) {
      this.activePhoneNumber = phoneNumber
      this.activePhoneApiKey = apiKey
      this.removePhoneFromApiKeyDialog = true
    },
    generateQrCode(text: string) {
      const canvas = this.$refs.qrCodeCanvas
      if (canvas) {
        QRCode.toCanvas(
          canvas,
          text,
          { errorCorrectionLevel: 'H' },
          (err: any) => {
            if (err) {
              this.$store.dispatch('addNotification', {
                message: 'Nije uspjelo stvaranje QR koda API ključa telefona',
                type: 'error',
              })
            }
          },
        )
      }
    },
    loadPhoneApiKeys() {
      this.loading = true
      this.$store
        .dispatch('indexPhoneApiKeys')
        .then((phoneApiKeys: Array<EntitiesPhoneAPIKey>) => {
          this.phoneApiKeys = phoneApiKeys
        })
        .finally(() => {
          this.loading = false
        })
    },
    removePhoneFromPhoneKey() {
      this.loading = true
      this.$store
        .dispatch('deletePhoneFromPhoneApiKey', {
          phoneApiKeyId: this.activePhoneApiKey?.id,
          phoneId: this.$store.getters.getPhones.find(
            (phone: EntitiesPhone) =>
              phone.phone_number === this.activePhoneNumber,
          )?.id,
        })
        .then(() => {
          this.removePhoneFromApiKeyDialog = false
          this.loadPhoneApiKeys()
        })
        .finally(() => {
          this.loading = false
        })
    },
    deleteApiKey() {
      this.loading = true
      this.$store
        .dispatch('deletePhoneApiKey', this.activePhoneApiKey?.id)
        .then(() => {
          this.deleteApiKeyDialog = false
          this.loadPhoneApiKeys()
        })
        .finally(() => {
          this.loading = false
        })
    },
    createPhoneApiKey() {
      this.errorMessages = new ErrorMessages()
      this.loading = true
      this.$store
        .dispatch('storePhoneApiKey', this.formPhoneApiKeyName)
        .then(() => {
          this.formPhoneApiKeyName = ''
          this.showCreateAPIKeyDialog = false
          this.loadPhoneApiKeys()
        })
        .catch((error: AxiosError<ResponsesUnprocessableEntity>) => {
          this.errorMessages = getErrorMessages(error)
          this.loading = false
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
})
</script>
<style scoped lang="scss">
.api-key-table {
  tbody {
    tr:hover {
      background-color: transparent !important;
    }
  }
}
</style>
