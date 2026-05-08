<template>
  <v-container
    fluid
    class="px-0 pt-0"
    :fill-height="$vuetify.breakpoint.lgAndUp"
  >
    <div class="w-full h-full">
      <v-app-bar height="60" fixed :dense="$vuetify.breakpoint.mdAndDown">
        <v-btn icon to="/threads">
          <v-icon>{{ mdiArrowLeft }}</v-icon>
        </v-btn>
        <v-toolbar-title>
          <div class="py-16">Postavke</div>
        </v-toolbar-title>
      </v-app-bar>
      <v-container class="mt-16">
        <v-row>
          <v-col cols="12" md="9" offset-md="1" xl="8" offset-xl="2">
            <div v-if="$fire.auth.currentUser" class="text-center">
              <v-avatar size="100" color="indigo" class="mx-auto">
                <img
                  v-if="$fire.auth.currentUser.photoURL"
                  :src="$fire.auth.currentUser.photoURL"
                  :alt="$fire.auth.currentUser.displayName"
                />
                <v-icon v-else dark size="70">{{ mdiAccountCircle }}</v-icon>
              </v-avatar>
              <h3 v-if="$fire.auth.currentUser.displayName">
                {{ $fire.auth.currentUser.displayName }}
              </h3>
              <h4 class="text--secondary">
                {{ $fire.auth.currentUser.email }}
                <v-icon
                  v-if="$fire.auth.currentUser.emailVerified"
                  small
                  color="primary"
                >
                  {{ mdiShieldCheck }}
                </v-icon>
              </h4>
              <v-autocomplete
                v-if="$store.getters.getUser"
                dense
                outlined
                :value="$store.getters.getUser.timezone"
                class="mx-auto mt-2"
                style="max-width: 250px"
                label="Vremenska zona"
                :items="timezones"
                @change="updateTimezone"
              ></v-autocomplete>
            </div>

            <h5 class="text-h4 mb-3 mt-3">API ključ</h5>
            <p class="text--secondary">
              Koristite svoj API ključ u <code>x-api-key</code> HTTP zaglavlju
              prilikom slanja zahtjeva na krajnje točke
              <code>https://sms-api.domovina.ai</code>.
            </p>
            <div v-if="apiKey === ''" class="mb-n9 pl-3 pt-5">
              <v-progress-circular
                :size="20"
                :width="2"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </div>
            <v-text-field
              v-else
              :append-icon="apiKeyShow ? mdiEye : mdiEyeOff"
              :type="apiKeyShow ? 'text' : 'password'"
              :value="apiKey"
              readonly
              name="api-key"
              outlined
              class="mb-n2"
              @click:append="apiKeyShow = !apiKeyShow"
            ></v-text-field>
            <div class="d-flex flex-wrap">
              <copy-button
                :value="apiKey"
                color="primary"
                copy-text="Kopiraj API ključ"
                notification-text="API ključ uspješno kopiran"
              ></copy-button>
              <v-btn
                v-if="$vuetify.breakpoint.mdAndUp"
                color="primary"
                class="ml-4"
                @click="showQrCodeDialog = true"
              >
                <v-icon left>{{ mdiQrcode }}</v-icon>
                Prikaži QR kod
              </v-btn>
              <v-dialog
                v-model="showQrCodeDialog"
                overlay-opacity="0.9"
                max-width="400px"
              >
                <v-card>
                  <v-card-title class="justify-center"
                    >QR kod API ključa</v-card-title
                  >
                  <v-card-subtitle class="mt-2 text-center"
                    >Skenirajte ovaj QR kod s
                    <a :href="$store.getters.getAppData.appDownloadUrl"
                      >Domovina SMS aplikacijom</a
                    >
                    na svom Android telefonu za prijavu.</v-card-subtitle
                  >
                  <v-card-text class="text-center">
                    <canvas ref="qrCodeCanvas"></canvas>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      block
                      class="mb-4"
                      @click="showQrCodeDialog = false"
                      >Zatvori</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-btn
                v-if="$vuetify.breakpoint.lgAndUp"
                class="ml-4"
                :href="$store.getters.getAppData.documentationUrl"
                >Dokumentacija</v-btn
              >
              <v-spacer></v-spacer>
              <v-dialog
                v-model="showRotateApiKey"
                overlay-opacity="0.9"
                max-width="550"
              >
                <template #activator="{ on, attrs }">
                  <v-btn
                    :small="$vuetify.breakpoint.mdAndDown"
                    :text="$vuetify.breakpoint.lgAndUp"
                    color="warning"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon left>{{ mdiRefresh }}</v-icon>
                    Obnovi API ključ
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="text-h5 text-break">
                    Jeste li sigurni da želite obnoviti svoj API ključ?
                  </v-card-title>
                  <v-card-text>
                    Morat ćete se odjaviti i ponovno prijaviti u
                    <b>Domovina SMS</b> Android aplikaciju s novim API ključem
                    nakon što ga obnovite.
                  </v-card-text>
                  <v-card-actions class="pb-4">
                    <v-btn
                      color="primary"
                      :loading="rotatingApiKey"
                      @click="rotateApiKey"
                    >
                      <v-icon left>{{ mdiRefresh }}</v-icon>
                      Da, obnovi ključ
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showRotateApiKey = false">
                      Zatvori
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
            <h5 id="webhook-settings" class="text-h4 mb-3 mt-12">Webhookovi</h5>
            <p class="text--secondary">
              Webhookovi nam omogućuju slanje događaja na vaš poslužitelj —
              primjerice, kada Android telefon primi SMS poruku, možemo je
              proslijediti na vaš poslužitelj.
            </p>
            <div v-if="loadingWebhooks">
              <v-progress-circular
                :size="60"
                :width="2"
                color="primary"
                class="mb-4"
                indeterminate
              ></v-progress-circular>
            </div>
            <v-simple-table v-else-if="webhooks.length" class="mb-4">
              <template #default>
                <thead>
                  <tr class="text-uppercase subtitle-2">
                    <th v-if="$vuetify.breakpoint.xlOnly" class="text-left">
                      ID
                    </th>
                    <th class="text-left text-break">Callback URL</th>
                    <th v-if="$vuetify.breakpoint.lgAndUp" class="text-center">
                      Događaji
                    </th>
                    <th class="text-center">Radnja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="webhook in webhooks" :key="webhook.id">
                    <td v-if="$vuetify.breakpoint.xlOnly" class="text-left">
                      {{ webhook.id }}
                    </td>
                    <td class="text-break">{{ webhook.url }}</td>
                    <td v-if="$vuetify.breakpoint.lgAndUp" class="text-center">
                      <v-chip
                        v-for="event in webhook.events"
                        :key="event"
                        class="ma-1"
                        small
                        >{{ event }}</v-chip
                      >
                    </td>
                    <td class="text-center">
                      <v-btn
                        :icon="$vuetify.breakpoint.mdAndDown"
                        small
                        color="info"
                        :disabled="updatingWebhook"
                        @click.prevent="onWebhookEdit(webhook.id)"
                      >
                        <v-icon small>{{ mdiSquareEditOutline }}</v-icon>
                        <span v-if="!$vuetify.breakpoint.mdAndDown">
                          Uredi
                        </span>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <div class="d-flex">
              <v-btn color="primary" @click="onWebhookCreate">
                <v-icon left>{{ mdiLinkVariant }}</v-icon>
                Dodaj webhook
              </v-btn>
              <v-btn
                v-if="$vuetify.breakpoint.lgAndUp"
                class="ml-4"
                href="https://github.com/domovinatv/sms.domovina.ai/webhooks/introduction"
                >Dokumentacija</v-btn
              >
            </div>

            <h5 id="discord-settings" class="text-h4 mb-3 mt-12">
              Discord integracija
            </h5>
            <p class="text--secondary">
              Šaljite i primajte SMS poruke bez napuštanja svog Discord
              poslužitelja putem Domovina SMS Discord aplikacije koristeći
              naredbu <code>/domovina-sms</code>.
            </p>
            <div v-if="loadingDiscordIntegrations">
              <v-progress-circular
                :size="60"
                :width="2"
                color="primary"
                class="mb-4"
                indeterminate
              ></v-progress-circular>
            </div>
            <v-simple-table v-else-if="discords.length" class="mb-4">
              <template #default>
                <thead>
                  <tr class="text-uppercase subtitle-2">
                    <th class="text-left">Naziv</th>
                    <th class="text-left">ID poslužitelja</th>
                    <th class="text-left">ID kanala</th>
                    <th class="text-center">Radnja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="discord in discords" :key="discord.id">
                    <td class="text-left">
                      {{ discord.name }}
                    </td>
                    <td class="text-left">
                      {{ discord.server_id }}
                    </td>
                    <td class="text-left">
                      {{ discord.incoming_channel_id }}
                    </td>
                    <td class="text-center">
                      <v-btn
                        :icon="$vuetify.breakpoint.mdAndDown"
                        small
                        color="info"
                        :disabled="updatingDiscord"
                        @click.prevent="onDiscordEdit(discord.id)"
                      >
                        <v-icon small>{{ mdiSquareEditOutline }}</v-icon>
                        <span v-if="!$vuetify.breakpoint.mdAndDown">
                          Uredi
                        </span>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <v-btn color="#5865f2" @click="onDiscordCreate">
              <v-img
                contain
                height="24"
                width="24"
                class="mr-2"
                :src="require('assets/img/discord-logo.svg')"
              ></v-img>
              Dodaj Discord
            </v-btn>

            <h5 id="phones" class="text-h4 mb-3 mt-12">Telefoni</h5>
            <p class="text--secondary">
              Popis mobilnih telefona registriranih za slanje i primanje SMS
              poruka.
            </p>
            <v-simple-table>
              <template #default>
                <thead>
                  <tr class="text-uppercase subtitle-2">
                    <th v-if="$vuetify.breakpoint.xlOnly" class="text-left">
                      ID
                    </th>
                    <th class="text-left">Broj telefona</th>
                    <th v-if="$vuetify.breakpoint.lgAndUp" class="text-center">
                      Pokušaji
                    </th>
                    <th class="text-center">Brzina</th>
                    <th class="text-center">Ažurirano</th>
                    <th class="text-center">Radnja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="phone in $store.getters.getPhones" :key="phone.id">
                    <td v-if="$vuetify.breakpoint.xlOnly" class="text-left">
                      {{ phone.id }}
                    </td>
                    <td>{{ phone.phone_number | phoneNumber }}</td>
                    <td v-if="$vuetify.breakpoint.lgAndUp">
                      <div class="d-flex justify-center">
                        {{
                          phone.max_send_attempts ? phone.max_send_attempts : 1
                        }}
                      </div>
                    </td>
                    <td class="text-center">
                      <span v-if="phone.messages_per_minute"
                        >{{ phone.messages_per_minute }}/min</span
                      >
                      <span v-else>Neograničeno</span>
                    </td>
                    <td class="text-center">
                      {{ phone.updated_at | timestamp }}
                    </td>
                    <td class="text-center">
                      <v-btn
                        :icon="$vuetify.breakpoint.mdAndDown"
                        color="info"
                        small
                        :disabled="updatingPhone"
                        @click.prevent="showEditPhone(phone.id)"
                      >
                        <v-icon small>{{ mdiSquareEditOutline }}</v-icon>
                        <span v-if="!$vuetify.breakpoint.mdAndDown">
                          Uredi
                        </span>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>

            <h5 id="send-schedules" class="text-h4 mb-3 mt-12">
              Rasporedi slanja
            </h5>
            <p class="text--secondary">
              Stvorite rasporede dostupnosti i pridružite ih pojedinom telefonu.
              Odlazne poruke poslane izvan vremenskog okvira rasporeda stavljaju
              se u red čekanja te se isporučuju kad se raspored otvori, u
              skladu s vašom
              <a
                class="text-decoration-none"
                href="https://github.com/domovinatv/sms.domovina.ai/features/control-sms-send-rate"
                >postavljenom brzinom slanja</a
              >.
            </p>
            <v-simple-table>
              <template #default>
                <thead>
                  <tr class="text-uppercase subtitle-2">
                    <th class="text-left">Naziv</th>
                    <th class="text-left">Vremenska zona</th>
                    <th class="text-left">Raspored</th>
                    <th class="text-center">Radnja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="schedule in sendSchedules" :key="schedule.id">
                    <td class="text-left pt-2" style="vertical-align: top">
                      {{ schedule.name }}
                    </td>
                    <td class="pt-2" style="vertical-align: top">
                      {{ schedule.timezone }}
                    </td>
                    <td class="py-2">
                      <div
                        v-for="line in scheduleSummary(schedule)"
                        :key="`${schedule.id}-${line}`"
                        class="mb-1"
                      >
                        {{ line[0] }}:
                        <span class="text--secondary">{{ line[1] }}</span>
                      </div>
                    </td>
                    <td class="text-center pt-2" style="vertical-align: top">
                      <v-btn
                        :icon="$vuetify.breakpoint.mdAndDown"
                        color="info"
                        small
                        :disabled="loadingSendSchedules"
                        @click.prevent="openEditSchedule(schedule)"
                      >
                        <v-icon small>{{ mdiSquareEditOutline }}</v-icon>
                        <span v-if="!$vuetify.breakpoint.mdAndDown">
                          Uredi
                        </span>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <v-btn color="primary" class="mt-4" @click="openCreateSchedule">
              <v-icon left>{{ mdiCalendarClock }}</v-icon>
              Stvori raspored slanja
            </v-btn>

            <h5 id="email-notifications" class="text-h4 mb-3 mt-12">
              Obavijesti e-poštom
            </h5>
            <p class="text--secondary">
              Upravljajte obavijestima e-poštom koje primate od Domovina SMS-a.
              Slobodno bilo kada uključite ili isključite pojedine obavijesti
              kako vas ne bi pretrpale e-pošte.
            </p>
            <v-switch
              v-model="notificationSettings.heartbeat_enabled"
              label="Obavijesti o otkucajima"
              :disabled="updatingEmailNotifications"
              hint="Ova sklopka kontrolira obavijesti e-poštom koje šaljemo kada od vašeg telefona ne primimo otkucaj 1 sat."
              persistent-hint
            ></v-switch>
            <v-switch
              v-model="notificationSettings.webhook_enabled"
              label="Obavijesti za webhook i Discord"
              :disabled="updatingEmailNotifications"
              hint="Ova sklopka kontrolira obavijesti e-poštom koje šaljemo kada ne uspijemo proslijediti događaje na vaš Discord poslužitelj ili webhook."
              persistent-hint
            ></v-switch>
            <v-switch
              v-model="notificationSettings.message_status_enabled"
              label="Obavijesti o statusu poruka"
              :disabled="updatingEmailNotifications"
              hint="Ova sklopka kontrolira obavijesti e-poštom koje šaljemo kada vaša poruka nije uspjela ili je istekla."
              persistent-hint
            ></v-switch>
            <v-switch
              v-model="notificationSettings.newsletter_enabled"
              label="Newsletter"
              :disabled="updatingEmailNotifications"
              hint="Ova sklopka kontrolira newsletter e-pošte o novim značajkama, ažuriranjima i promocijama."
              persistent-hint
            ></v-switch>
            <v-btn
              color="primary"
              :loading="updatingEmailNotifications"
              class="mt-4"
              @click="saveEmailNotifications"
            >
              <v-icon left>{{ mdiContentSave }}</v-icon>
              Spremi postavke obavijesti
            </v-btn>

            <h5 id="email-notifications" class="text-h4 error--text mb-3 mt-12">
              Brisanje računa
            </h5>
            <p v-if="hasActiveSubscription" class="text--secondary">
              Ne možete obrisati svoj račun jer imate aktivnu pretplatu na
              Domovina SMS-u.
              <router-link class="text-decoration-none" to="/billing"
                >Otkažite pretplatu</router-link
              >
              prije brisanja svog računa.
            </p>
            <p v-else class="text--secondary">
              Klikom na gumb u nastavku možete obrisati sve svoje podatke na
              Domovina SMS-u. Ova radnja je <b>nepovratna</b> i svi vaši podaci
              bit će trajno i odmah izbrisani iz Domovina SMS baze podataka te
              se neće moći vratiti.
            </p>
            <v-btn
              color="error"
              :loading="deletingAccount"
              class="mt-4"
              :disabled="hasActiveSubscription"
              @click="showDeleteAccountDialog = true"
            >
              <v-icon left>{{ mdiDelete }}</v-icon>
              Obriši račun
            </v-btn>
            <v-dialog
              v-model="showDeleteAccountDialog"
              overlay-opacity="0.9"
              max-width="600px"
            >
              <v-card>
                <v-card-title class="justify-center text-center"
                  >Obriši svoj Domovina SMS račun</v-card-title
                >
                <v-card-text class="mt-2 text-center">
                  Jeste li sigurni da želite obrisati svoj račun? Ova radnja
                  je <b>nepovratna</b> i svi vaši podaci bit će trajno i odmah
                  izbrisani iz Domovina SMS baze podataka.
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="error"
                    text
                    :loading="deletingAccount"
                    @click="deleteUserAccount"
                  >
                    <v-icon v-if="$vuetify.breakpoint.lgAndUp" left>{{
                      mdiDelete
                    }}</v-icon>
                    Obriši moj račun
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    @click="showDeleteAccountDialog = false"
                  >
                    <span v-if="$vuetify.breakpoint.lgAndUp"
                      >Zadrži moj račun</span
                    >
                    <span v-else>Zatvori</span>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-dialog v-model="showPhoneEdit" overlay-opacity="0.9" max-width="700px">
      <v-card>
        <v-card-title>Uredi telefon</v-card-title>
        <v-card-text v-if="activePhone" class="mt-6">
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  outlined
                  dense
                  disabled
                  label="ID"
                  :value="activePhone.id"
                >
                </v-text-field>
                <v-text-field
                  outlined
                  disabled
                  dense
                  label="Broj telefona"
                  :value="activePhone.phone_number"
                >
                </v-text-field>
                <v-text-field
                  outlined
                  disabled
                  dense
                  label="SIM"
                  :value="activePhone.sim"
                >
                </v-text-field>
                <v-textarea
                  outlined
                  disabled
                  dense
                  label="FCM token"
                  :value="activePhone.fcm_token"
                >
                </v-textarea>
                <v-text-field
                  v-model="activePhone.message_expiration_seconds"
                  outlined
                  type="number"
                  dense
                  label="Istek poruke (sekunde)"
                >
                </v-text-field>
                <v-text-field
                  v-model="activePhone.messages_per_minute"
                  outlined
                  type="number"
                  dense
                  label="Poruka u minuti"
                >
                </v-text-field>
                <v-text-field
                  v-model="activePhone.max_send_attempts"
                  outlined
                  type="number"
                  dense
                  placeholder="Koliko pokušaja prilikom slanja SMS-a"
                  label="Maksimalan broj pokušaja slanja"
                  min="1"
                  max="5"
                  :rules="[
                    (v) =>
                      (v >= 1 && v <= 5) ||
                      'Maksimalan broj pokušaja slanja mora biti između 1 i 5',
                  ]"
                >
                </v-text-field>
                <v-autocomplete
                  v-model="activePhone.message_send_schedule_id"
                  outlined
                  :readonly="sendSchedules.length === 0"
                  dense
                  clearable
                  label="Raspored slanja"
                  :items="sendSchedules"
                  item-text="name"
                  item-value="id"
                  :multiple="false"
                  hint="Pridruži raspored slanja ovom telefonu"
                  persistent-hint
                ></v-autocomplete>
                <v-textarea
                  v-model="activePhone.missed_call_auto_reply"
                  outlined
                  dense
                  label="Automatski odgovor na propušteni poziv"
                  persistent-placeholder
                  persistent-hint
                  placeholder="Trenutno smo zatvoreni, molimo pošaljite nam poruku između 09:00 i 17:00"
                  hint="Ovdje možete konfigurirati automatsku SMS poruku koja se šalje pozivatelju kada ovaj telefon ima propušten poziv"
                >
                </v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="mt-n8">
          <v-btn small color="info" @click="updatePhone">
            <v-icon v-if="$vuetify.breakpoint.lgAndUp" small>
              {{ mdiContentSave }}
            </v-icon>
            Ažuriraj
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            small
            color="error"
            text
            @click="deletePhone(activePhone?.id ?? '')"
          >
            <v-icon v-if="$vuetify.breakpoint.lgAndUp" small>
              {{ mdiDelete }}
            </v-icon>
            Obriši
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showWebhookEdit" overlay-opacity="0.9" max-width="600px">
      <v-card>
        <v-card-title>
          <span v-if="!activeWebhook.id">Dodaj novi&nbsp;</span>
          <span v-else>Uredi&nbsp;</span>
          webhook
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col class="pt-8">
              <v-text-field
                v-if="activeWebhook.id"
                outlined
                dense
                disabled
                label="ID"
                :value="activeWebhook.id"
              >
              </v-text-field>
              <v-text-field
                v-model="activeWebhook.url"
                outlined
                dense
                label="Callback URL"
                persistent-placeholder
                persistent-hint
                :error="errorMessages.has('url')"
                :error-messages="errorMessages.get('url')"
                hint="POST zahtjev će biti poslan na ovaj URL svaki put kada se u Domovina SMS-u pokrene događaj."
                placeholder="https://example.com/webhook"
              >
              </v-text-field>
              <v-text-field
                v-model="activeWebhook.signing_key"
                outlined
                dense
                class="mt-6"
                persistent-placeholder
                persistent-hint
                label="Ključ za potpisivanje (neobavezno)"
                placeholder="******************"
                :error="errorMessages.has('signing_key')"
                :error-messages="errorMessages.get('signing_key')"
                hint="Ključ za potpisivanje koristi se za provjeru da je webhook poslan iz Domovina SMS-a."
              >
              </v-text-field>
              <v-select
                v-model="activeWebhook.events"
                :items="events"
                label="Događaji"
                multiple
                outlined
                persistent-placeholder
                class="mt-6"
                dense
                :error="errorMessages.has('events')"
                :error-messages="errorMessages.get('events')"
                hint="Odaberite više Domovina SMS događaja koje želite pratiti"
                persistent-hint
              ></v-select>
              <v-select
                v-model="activeWebhook.phone_numbers"
                :items="phoneNumbers"
                label="Brojevi telefona"
                multiple
                outlined
                persistent-placeholder
                class="mt-6"
                dense
                :error="errorMessages.has('phone_numbers')"
                :error-messages="errorMessages.get('phone_numbers')"
                hint="Odaberite više brojeva telefona za praćenje događaja"
                persistent-hint
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="mt-n4 pb-4">
          <loading-button
            v-if="!activeWebhook.id"
            :icon="mdiContentSave"
            :loading="updatingWebhook"
            @click="createWebhook"
          >
            Spremi webhook
          </loading-button>
          <loading-button
            v-else
            small
            color="info"
            :loading="updatingWebhook"
            @click="updateWebhook"
          >
            <v-icon v-if="$vuetify.breakpoint.lgAndUp" small>
              {{ mdiContentSave }}
            </v-icon>
            Ažuriraj webhook
          </loading-button>
          <v-spacer></v-spacer>
          <v-btn
            v-if="activeWebhook.id"
            :disabled="updatingWebhook"
            small
            color="error"
            text
            @click="deleteWebhook(activeWebhook.id)"
          >
            <v-icon v-if="$vuetify.breakpoint.lgAndUp" small>
              {{ mdiDelete }}
            </v-icon>
            Obriši
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDiscordEdit" overlay-opacity="0.9" max-width="700px">
      <v-card>
        <v-card-title>
          <span v-if="!activeDiscord.id">Dodaj novu&nbsp;</span>
          <span v-else>Uredi&nbsp;</span>
          Discord integraciju
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col class="pt-8">
              <p class="mt-n4 subtitle-1">
                Kliknite gumb u nastavku kako biste dodali Domovina SMS bota na
                svoj Discord poslužitelj. To je potrebno kako bismo imali
                ovlasti za slanje i primanje poruka na vašem Discord
                poslužitelju.
              </p>
              <v-btn
                color="#5865f2"
                class="mb-6"
                target="_blank"
                href="https://discord.com/api/oauth2/authorize?client_id=1095780203256627291&permissions=2147485760&scope=bot%20applications.commands"
              >
                <v-icon left>{{ mdiConnection }}</v-icon>
                Dodaj Discord bota
              </v-btn>
              <v-text-field
                v-if="activeDiscord.id"
                outlined
                dense
                disabled
                label="ID"
                :value="activeDiscord.id"
              >
              </v-text-field>
              <v-text-field
                v-model="activeDiscord.name"
                outlined
                dense
                label="Naziv"
                persistent-placeholder
                persistent-hint
                :error="errorMessages.has('name')"
                :error-messages="errorMessages.get('name')"
                hint="Naziv Discord integracije"
                placeholder="npr. Igrački poslužitelj"
              >
              </v-text-field>
              <v-text-field
                v-model="activeDiscord.server_id"
                outlined
                dense
                class="mt-6"
                persistent-placeholder
                persistent-hint
                label="ID Discord poslužitelja"
                placeholder="npr. 1095778291488653372"
                :error="errorMessages.has('server_id')"
                :error-messages="errorMessages.get('server_id')"
                hint="Možete ga dobiti tako da desnim klikom na svoj poslužitelj odaberete Copy Server ID."
              >
              </v-text-field>
              <v-text-field
                v-model="activeDiscord.incoming_channel_id"
                outlined
                dense
                class="mt-6"
                persistent-placeholder
                persistent-hint
                label="ID Discord dolaznog kanala"
                placeholder="npr. 1095778291488653372"
                :error="errorMessages.has('incoming_channel_id')"
                :error-messages="errorMessages.get('incoming_channel_id')"
                hint="Možete ga dobiti tako da desnim klikom na svoj Discord kanal odaberete Copy Channel ID."
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="mt-n4 pb-4 pl-6">
          <loading-button
            v-if="!activeDiscord.id"
            :icon="mdiContentSave"
            :loading="updatingDiscord"
            @click="createDiscord"
          >
            Spremi Discord integraciju
          </loading-button>
          <loading-button
            v-else
            color="info"
            :loading="updatingDiscord"
            @click="updateDiscord"
          >
            <v-icon v-if="$vuetify.breakpoint.lgAndUp" small>
              {{ mdiContentSave }}
            </v-icon>
            Ažuriraj Discord integraciju
          </loading-button>
          <v-spacer></v-spacer>
          <v-btn
            v-if="activeDiscord.id"
            :disabled="updatingDiscord"
            color="error"
            text
            @click="deleteDiscord(activeDiscord.id)"
          >
            <v-icon v-if="$vuetify.breakpoint.lgAndUp" small>
              {{ mdiDelete }}
            </v-icon>
            Obriši
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showScheduleEdit"
      overlay-opacity="0.9"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span v-if="!activeSchedule.id">Stvori raspored slanja poruka</span>
          <span v-else>Uredi raspored slanja poruka</span>
        </v-card-title>
        <v-card-text
          class="mt-4"
          :class="{ 'px-2': $vuetify.breakpoint.mdAndDown }"
        >
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="activeSchedule.name"
                outlined
                dense
                persistent-placeholder
                label="Naziv rasporeda"
                placeholder="npr. Radno vrijeme"
                :error="errorMessages.has('name')"
                :error-messages="errorMessages.get('name')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="activeSchedule.timezone"
                dense
                outlined
                :items="timezones"
                label="Vremenska zona"
                :class="{ 'mt-n6 mb-0': $vuetify.breakpoint.mdAndDown }"
                :error="errorMessages.has('timezone')"
                :error-messages="errorMessages.get('timezone')"
              />
            </v-col>
          </v-row>
          <v-card
            :outlined="!$vuetify.breakpoint.mdAndDown"
            elevation="0"
            class="px-0"
          >
            <v-card-text
              :class="{
                'px-2 mt-n8': $vuetify.breakpoint.mdAndDown,
                'px-4': !$vuetify.breakpoint.mdAndDown,
              }"
            >
              <div
                v-for="day in weekDays"
                :key="day.value"
                :class="[
                  $vuetify.breakpoint.smAndUp ? 'd-flex align-start' : '',
                  'mb-4',
                ]"
              >
                <div
                  :class="[$vuetify.breakpoint.smAndUp ? 'pr-4' : '', 'pt-2']"
                  :style="$vuetify.breakpoint.smAndUp ? 'min-width: 160px' : ''"
                >
                  <v-switch
                    :input-value="scheduleDayEnabled(day.value)"
                    inset
                    dense
                    :label="day.label"
                    class="mt-0 pt-0 text--primary"
                    @change="scheduleToggleDay(day.value, $event)"
                  />
                </div>
                <div class="pt-2 flex-grow-1">
                  <div
                    v-for="(window, index) in scheduleWindowsForDay(day.value)"
                    :key="`${day.value}-${index}`"
                    class="d-flex align-center flex-wrap mb-2"
                  >
                    <div
                      class="mr-2 mb-2"
                      style="width: 110px; max-width: 100%"
                    >
                      <v-text-field
                        v-model="window.start_time"
                        dense
                        outlined
                        :error="scheduleWindowError(day.value)"
                        type="time"
                        label="Početak"
                        hide-details="auto"
                      />
                    </div>
                    <div class="mb-2 mr-2">–</div>
                    <div
                      class="mr-2 mb-2"
                      style="width: 110px; max-width: 100%"
                    >
                      <v-text-field
                        v-model="window.end_time"
                        dense
                        outlined
                        :error="scheduleWindowError(day.value)"
                        type="time"
                        label="Kraj"
                        hide-details="auto"
                      />
                    </div>
                    <div class="mb-2">
                      <v-btn
                        v-if="index == 0"
                        icon
                        color="primary"
                        @click="scheduleAddWindow(day.value)"
                      >
                        <v-icon>{{ mdiPlus }}</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        color="error"
                        @click="scheduleRemoveWindow(day.value, index)"
                      >
                        <v-icon>{{ mdiDelete }}</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <div
                    v-if="scheduleWindowError(day.value)"
                    class="w-full error--text mt-n2 mb-4"
                  >
                    {{ scheduleWindowError(day.value) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions class="pb-4">
          <loading-button
            v-if="!activeSchedule.id"
            :icon="mdiContentSave"
            :loading="savingSchedule"
            @click="saveSchedule"
          >
            Spremi raspored
          </loading-button>
          <loading-button
            v-else
            color="info"
            :loading="savingSchedule"
            @click="saveSchedule"
          >
            <v-icon v-if="$vuetify.breakpoint.lgAndUp" small>
              {{ mdiContentSave }}
            </v-icon>
            Ažuriraj raspored
          </loading-button>
          <v-spacer></v-spacer>
          <v-btn
            v-if="activeSchedule.id"
            :disabled="savingSchedule"
            color="error"
            text
            @click="confirmDeleteSchedule"
          >
            <v-icon v-if="$vuetify.breakpoint.lgAndUp" small left>
              {{ mdiDelete }}
            </v-icon>
            Obriši
          </v-btn>
          <v-btn v-else text color="error" @click="showScheduleEdit = false">
            Zatvori
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showScheduleDelete" max-width="500">
      <v-card>
        <v-card-title>Brisanje rasporeda</v-card-title>
        <v-card-text>
          Jeste li sigurni da želite obrisati <b>{{ activeSchedule.name }}</b
          >? Telefoni pridruženi ovom rasporedu više neće imati ograničenja
          temeljena na rasporedu.
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="error"
            :loading="savingSchedule"
            @click="deleteSchedule"
          >
            Obriši
          </v-btn>
          <v-spacer />
          <v-btn text @click="showScheduleDelete = false">Odustani</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  mdiArrowLeft,
  mdiAccountCircle,
  mdiCalendarClock,
  mdiShieldCheck,
  mdiDelete,
  mdiContentSave,
  mdiConnection,
  mdiEye,
  mdiRefresh,
  mdiLinkVariant,
  mdiEyeOff,
  mdiPlus,
  mdiSquareEditOutline,
  mdiQrcode,
} from '@mdi/js'
import { toCanvas } from 'qrcode'
import { ErrorMessages } from '~/plugins/errors'
import LoadingButton from '~/components/LoadingButton.vue'
import {
  EntitiesDiscord,
  EntitiesMessageSendSchedule,
  EntitiesPhone,
  EntitiesWebhook,
} from '~/models/api'

export default Vue.extend({
  name: 'SettingsIndex',
  components: { LoadingButton },
  middleware: ['auth'],
  data() {
    return {
      mdiEye,
      mdiEyeOff,
      mdiRefresh,
      mdiArrowLeft,
      mdiAccountCircle,
      mdiCalendarClock,
      mdiShieldCheck,
      mdiDelete,
      mdiPlus,
      mdiQrcode,
      mdiLinkVariant,
      mdiContentSave,
      mdiSquareEditOutline,
      mdiConnection,
      errorMessages: new ErrorMessages(),
      apiKeyShow: false,
      showPhoneEdit: false,
      showDiscordEdit: false,
      showScheduleEdit: false,
      showScheduleDelete: false,
      savingSchedule: false,
      showRotateApiKey: false,
      rotatingApiKey: false,
      showQrCodeDialog: false,
      deletingAccount: false,
      showDeleteAccountDialog: false,
      activeWebhook: {
        id: null,
        url: '',
        signing_key: '',
        phone_numbers: [] as string[],
        events: ['message.phone.received'],
      } as {
        id: string | null
        url: string
        signing_key: string
        phone_numbers: string[]
        events: string[]
      },
      activeDiscord: {
        id: null,
        name: '',
        server_id: '',
        incoming_channel_id: '',
      } as {
        id: string | null
        name: string
        server_id: string
        incoming_channel_id: string
      },
      updatingEmailNotifications: false,
      notificationSettings: {
        webhook_enabled: true,
        message_status_enabled: true,
        newsletter_enabled: true,
        heartbeat_enabled: true,
      },
      updatingWebhook: false,
      loadingWebhooks: false,
      loadingSendSchedules: false,
      discords: [] as EntitiesDiscord[],
      webhooks: [] as EntitiesWebhook[],
      showWebhookEdit: false,
      activePhone: null as EntitiesPhone | null,
      updatingPhone: false,
      updatingDiscord: false,
      loadingDiscordIntegrations: false,
      sendSchedules: [] as EntitiesMessageSendSchedule[],
      events: [
        'message.phone.received',
        'message.phone.sent',
        'message.phone.delivered',
        'message.send.failed',
        'message.send.expired',
        'message.call.missed',
        'phone.heartbeat.offline',
        'phone.heartbeat.online',
      ],
      activeSchedule: {
        id: null,
        name: '',
        timezone: '',
        windows: [],
      } as {
        id: string | null
        name: string
        timezone: string
        windows: Array<{
          day_of_week: number
          start_time: string
          end_time: string
        }>
      },
      weekDays: [
        { value: 1, label: 'Ponedjeljak' },
        { value: 2, label: 'Utorak' },
        { value: 3, label: 'Srijeda' },
        { value: 4, label: 'Četvrtak' },
        { value: 5, label: 'Petak' },
        { value: 6, label: 'Subota' },
        { value: 0, label: 'Nedjelja' },
      ],
    }
  },
  head() {
    return {
      title: 'Postavke — Domovina SMS',
    }
  },
  computed: {
    apiKey() {
      if (this.$store.getters.getUser === null) {
        return ''
      }
      return this.$store.getters.getUser.api_key
    },
    hasActiveSubscription() {
      if (this.$store.getters.getUser === null) {
        return true
      }
      return this.$store.getters.getUser.subscription_renews_at != null
    },
    timezones() {
      try {
        // @ts-ignore
        return Intl.supportedValuesOf('timeZone')
      } catch {
        return []
      }
    },
    phoneNumbers() {
      return this.$store.getters.getPhones.map((phone: EntitiesPhone) => {
        return phone.phone_number
      })
    },
  },
  watch: {
    showQrCodeDialog(newVal) {
      if (newVal && this.apiKey) {
        this.$nextTick(() => {
          this.generateQrCode(this.apiKey)
        })
      }
    },
  },
  async mounted() {
    await Promise.all([
      this.$store.dispatch('clearAxiosError'),
      this.$store.dispatch('loadUser'),
      this.$store.dispatch('loadPhones'),
    ])
    this.loadWebhooks()
    this.loadDiscordIntegrations()
    this.loadSendSchedules()
    this.updateEmailNotifications()
    if (this.$route.hash) {
      await this.$vuetify.goTo(this.$route.hash)
    }
  },

  methods: {
    generateQrCode(text: string) {
      const canvas = this.$refs.qrCodeCanvas
      if (canvas) {
        toCanvas(canvas, text, { errorCorrectionLevel: 'H' }, (err) => {
          if (err) {
            this.$store.dispatch('addNotification', {
              message: 'Nije uspjelo stvaranje QR koda API ključa',
              type: 'error',
            })
          }
        })
      }
    },
    updateEmailNotifications() {
      this.notificationSettings = {
        webhook_enabled:
          this.$store.getters.getUser.notification_webhook_enabled,
        message_status_enabled:
          this.$store.getters.getUser.notification_message_status_enabled,
        heartbeat_enabled:
          this.$store.getters.getUser.notification_heartbeat_enabled,
        newsletter_enabled:
          this.$store.getters.getUser.notification_newsletter_enabled,
      }
    },
    showEditPhone(phoneId: string) {
      const phone = this.$store.getters.getPhones.find(
        (x: EntitiesPhone) => x.id === phoneId,
      )
      if (!phone) {
        return
      }
      this.activePhone = { ...phone }
      this.showPhoneEdit = true
      this.resetErrors()
    },

    onWebhookEdit(webhookId: string) {
      const webhook = this.webhooks.find(
        (x: EntitiesWebhook) => x.id === webhookId,
      ) as EntitiesWebhook | undefined
      if (!webhook) {
        return
      }
      this.activeWebhook = {
        id: webhook.id,
        url: webhook.url,
        phone_numbers: webhook.phone_numbers.filter(
          (x: string) =>
            this.phoneNumbers.find((y: string) => y === x) !== undefined,
        ),
        signing_key: webhook.signing_key,
        events: webhook.events,
      }
      this.showWebhookEdit = true
      this.resetErrors()
    },

    onDiscordEdit(discordId: string) {
      const discord = this.discords.find(
        (x: EntitiesDiscord) => x.id === discordId,
      ) as EntitiesDiscord | undefined
      if (!discord) {
        return
      }
      this.activeDiscord = {
        id: discord.id,
        name: discord.name,
        server_id: discord.server_id,
        incoming_channel_id: discord.incoming_channel_id,
      }
      this.showDiscordEdit = true
      this.resetErrors()
    },

    onWebhookCreate() {
      this.activeWebhook = {
        id: null,
        url: '',
        signing_key: '',
        phone_numbers: this.$store.getters.getPhones.map(
          (phone: EntitiesPhone) => phone.phone_number,
        ),
        events: [
          'message.phone.received',
          'message.phone.sent',
          'message.phone.delivered',
          'message.send.failed',
          'message.send.expired',
        ],
      }
      this.showWebhookEdit = true
      this.resetErrors()
    },

    onDiscordCreate() {
      this.activeDiscord = {
        id: null,
        name: '',
        server_id: '',
        incoming_channel_id: '',
      }
      this.showDiscordEdit = true
      this.resetErrors()
    },

    async updatePhone() {
      this.updatingPhone = true
      await this.$store.dispatch('clearAxiosError')
      this.$store.dispatch('updatePhone', this.activePhone).finally(() => {
        if (!this.$store.getters.getAxiosError) {
          this.updatingPhone = false
          this.showPhoneEdit = false
          this.activePhone = null
        }
      })
    },

    resetErrors() {
      this.errorMessages = new ErrorMessages()
    },

    createDiscord() {
      this.resetErrors()
      this.updatingDiscord = true
      this.$store
        .dispatch('createDiscord', this.activeDiscord)
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Discord integracija uspješno stvorena',
            type: 'success',
          })
          this.showDiscordEdit = false
          this.loadDiscordIntegrations()
        })
        .catch((errors: ErrorMessages) => {
          this.errorMessages = errors
        })
        .finally(() => {
          this.updatingDiscord = false
        })
    },

    saveEmailNotifications() {
      this.updatingEmailNotifications = true
      this.$store
        .dispatch('saveEmailNotifications', this.notificationSettings)
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Postavke obavijesti e-poštom uspješno spremljene',
            type: 'success',
          })
          this.updateEmailNotifications()
        })
        .finally(() => {
          this.updatingEmailNotifications = false
        })
    },

    updateDiscord() {
      this.resetErrors()
      this.updatingDiscord = true
      this.$store
        .dispatch('updateDiscordIntegration', this.activeDiscord)
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Discord integracija uspješno ažurirana',
            type: 'success',
          })
          this.showDiscordEdit = false
          this.loadDiscordIntegrations()
        })
        .catch((errors: ErrorMessages) => {
          this.errorMessages = errors
        })
        .finally(() => {
          this.updatingDiscord = false
        })
    },

    deleteDiscord(discordId: string) {
      this.updatingDiscord = true
      this.$store
        .dispatch('deleteDiscordIntegration', discordId)
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Discord integracija uspješno obrisana',
            type: 'success',
          })
          this.showDiscordEdit = false
          this.loadDiscordIntegrations()
        })
        .finally(() => {
          this.updatingDiscord = false
        })
    },

    createWebhook() {
      this.resetErrors()
      this.updatingWebhook = true
      this.$store
        .dispatch('createWebhook', this.activeWebhook)
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Webhook uspješno stvoren',
            type: 'success',
          })
          this.showWebhookEdit = false
          this.loadWebhooks()
        })
        .catch((errors: ErrorMessages) => {
          this.errorMessages = errors
        })
        .finally(() => {
          this.updatingWebhook = false
        })
    },

    updateTimezone(timezone: string) {
      this.resetErrors()
      this.$store
        .dispatch('updateTimezone', timezone)
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Vremenska zona uspješno ažurirana',
            type: 'success',
          })
        })
        .catch(() => {
          this.$store.dispatch('addNotification', {
            message: 'Nije uspjelo ažuriranje vremenske zone',
            type: 'error',
          })
        })
    },

    updateWebhook() {
      this.resetErrors()
      this.updatingWebhook = true
      this.$store
        .dispatch('updateWebhook', this.activeWebhook)
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Webhook uspješno ažuriran',
            type: 'success',
          })
          this.showWebhookEdit = false
          this.loadWebhooks()
        })
        .catch((errors: ErrorMessages) => {
          this.errorMessages = errors
        })
        .finally(() => {
          this.updatingWebhook = false
        })
    },

    rotateApiKey() {
      this.rotatingApiKey = true
      this.$store
        .dispatch('rotateApiKey', this.$store.getters.getUser.id)
        .finally(() => {
          this.rotatingApiKey = false
          this.showRotateApiKey = false
        })
    },

    deleteWebhook(webhookId: string) {
      this.updatingWebhook = true
      this.$store
        .dispatch('deleteWebhook', webhookId)
        .then(() => {
          this.$store.dispatch('addNotification', {
            message: 'Webhook uspješno obrisan',
            type: 'success',
          })
          this.showWebhookEdit = false
          this.loadWebhooks()
        })
        .finally(() => {
          this.updatingWebhook = false
        })
    },

    loadSendSchedules() {
      this.loadingSendSchedules = true
      this.$store
        .dispatch('getSendSchedules')
        .then((sendSchedules: EntitiesMessageSendSchedule[]) => {
          this.sendSchedules = sendSchedules
        })
        .finally(() => {
          this.loadingSendSchedules = false
        })
    },

    loadWebhooks() {
      this.loadingWebhooks = true
      this.$store
        .dispatch('getWebhooks')
        .then((webhooks: EntitiesWebhook[]) => {
          this.webhooks = webhooks
        })
        .finally(() => {
          this.loadingWebhooks = false
        })
    },

    loadDiscordIntegrations() {
      this.loadingDiscordIntegrations = true
      this.$store
        .dispatch('getDiscordIntegrations')
        .then((discords: EntitiesDiscord[]) => {
          this.discords = discords
        })
        .finally(() => {
          this.loadingDiscordIntegrations = false
        })
    },

    deleteUserAccount() {
      this.deletingAccount = true
      this.$store
        .dispatch('deleteUserAccount')
        .then((message: string) => {
          this.$store.dispatch('addNotification', {
            message: message ?? 'Vaš račun je uspješno obrisan',
            type: 'success',
          })
          this.$fire.auth.signOut().then(() => {
            this.$store.dispatch('setAuthUser', null)
            this.$store.dispatch('resetState')
            this.$store.dispatch('addNotification', {
              type: 'info',
              message: 'Uspješno ste odjavljeni',
            })
            this.$router.push({ name: 'index' })
          })
        })
        .finally(() => {
          this.deletingAccount = false
          this.showDeleteAccountDialog = false
        })
    },

    deletePhone(phoneId: string) {
      this.updatingPhone = true
      this.$store.dispatch('deletePhone', phoneId).finally(() => {
        this.updatingPhone = false
        this.showPhoneEdit = false
        this.activePhone = null
      })
    },

    minuteToClock(value: number) {
      const hours = String(Math.floor(value / 60)).padStart(2, '0')
      const minutes = String(value % 60).padStart(2, '0')
      return `${hours}:${minutes}`
    },

    clockToMinute(value: string) {
      if (!value || !value.includes(':')) {
        return 0
      }

      const [hours, minutes] = value.split(':').map((x) => parseInt(x, 10))
      return hours * 60 + minutes
    },

    getWeekday(index: number): string {
      return this.weekDays.find((x) => x.value === index)?.label ?? ''
    },

    scheduleSummary(schedule: EntitiesMessageSendSchedule) {
      return this.weekDays
        .map((day) => {
          const windows = (schedule.windows || []).filter(
            (x) => x.day_of_week === day.value,
          )

          if (windows.length === 0) {
            return []
          }
          return [
            day.label,
            windows
              .map(
                (w) =>
                  `${this.minuteToClock(w.start_minute)} - ${this.minuteToClock(
                    w.end_minute,
                  )}`,
              )
              .join(', '),
          ]
        })
        .filter((x: string[]) => x.length > 0)
    },

    defaultTimezone(): string {
      return (
        this.$store.getters.getUser?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone
      )
    },

    openCreateSchedule() {
      this.resetErrors()
      this.activeSchedule = {
        id: null,
        name: '',
        timezone: this.defaultTimezone(),
        windows: [
          { day_of_week: 1, start_time: '09:00', end_time: '17:00' },
          { day_of_week: 2, start_time: '09:00', end_time: '17:00' },
          { day_of_week: 3, start_time: '09:00', end_time: '17:00' },
          { day_of_week: 4, start_time: '09:00', end_time: '17:00' },
          { day_of_week: 5, start_time: '09:00', end_time: '17:00' },
        ],
      }
      this.showScheduleEdit = true
    },

    openEditSchedule(schedule: EntitiesMessageSendSchedule) {
      this.resetErrors()
      this.activeSchedule = {
        id: schedule.id,
        name: schedule.name,
        timezone: schedule.timezone,
        windows: (schedule.windows || []).map((x) => ({
          day_of_week: x.day_of_week,
          start_time: this.minuteToClock(x.start_minute),
          end_time: this.minuteToClock(x.end_minute),
        })),
      }
      this.showScheduleEdit = true
    },

    scheduleWindowsForDay(dayOfWeek: number) {
      return this.activeSchedule.windows.filter(
        (x) => x.day_of_week === dayOfWeek,
      )
    },

    scheduleDayEnabled(dayOfWeek: number) {
      return this.scheduleWindowsForDay(dayOfWeek).length > 0
    },

    scheduleToggleDay(dayOfWeek: number, enabled: boolean) {
      if (enabled) {
        if (!this.scheduleDayEnabled(dayOfWeek)) {
          this.scheduleAddWindow(dayOfWeek)
        }
        return
      }
      this.activeSchedule.windows = this.activeSchedule.windows.filter(
        (x) => x.day_of_week !== dayOfWeek,
      )
    },

    scheduleAddWindow(dayOfWeek: number) {
      this.activeSchedule.windows.push({
        day_of_week: dayOfWeek,
        start_time: '09:00',
        end_time: '17:00',
      })
    },

    scheduleWindowError(index: number): string | null {
      const messages = this.errorMessages.has('windows')
        ? this.errorMessages.get('windows')
        : []
      if (messages.length === 0) {
        return null
      }

      const message = messages.find((x: string) =>
        x.includes(`Day of week ${index}`),
      )
      return message
        ? message.replace(`Day of week ${index}`, this.getWeekday(index))
        : null
    },

    scheduleRemoveWindow(dayOfWeek: number, index: number) {
      const matches = this.activeSchedule.windows.filter(
        (x) => x.day_of_week === dayOfWeek,
      )
      const target = matches[index]
      this.activeSchedule.windows = this.activeSchedule.windows.filter(
        (x) => x !== target,
      )
    },

    async saveSchedule() {
      this.resetErrors()
      this.savingSchedule = true

      try {
        const payload = {
          name: this.activeSchedule.name,
          timezone: this.activeSchedule.timezone,
          windows: (this.activeSchedule.windows || []).map((window) => ({
            day_of_week: window.day_of_week,
            start_minute: this.clockToMinute(window.start_time),
            end_minute: this.clockToMinute(window.end_time),
          })),
        }

        if (this.activeSchedule.id) {
          await this.$store.dispatch('updateSendSchedule', {
            id: this.activeSchedule.id,
            ...payload,
          })
        } else {
          await this.$store.dispatch('createSendSchedule', payload)
        }

        this.$store.dispatch('addNotification', {
          type: 'success',
          message: 'Raspored slanja uspješno spremljen',
        })

        this.showScheduleEdit = false
        this.loadSendSchedules()
      } catch (errors) {
        if (errors instanceof ErrorMessages) {
          this.errorMessages = errors
        } else {
          this.$store.dispatch('addNotification', {
            type: 'error',
            message: 'Nije uspjelo spremanje rasporeda slanja',
          })
        }
      } finally {
        this.savingSchedule = false
      }
    },

    confirmDeleteSchedule() {
      this.showScheduleDelete = true
    },

    async deleteSchedule() {
      if (!this.activeSchedule.id) {
        return
      }

      this.savingSchedule = true

      try {
        await this.$store.dispatch('deleteSendSchedule', this.activeSchedule.id)

        this.$store.dispatch('addNotification', {
          type: 'success',
          message: 'Raspored slanja uspješno obrisan',
        })

        this.showScheduleDelete = false
        this.showScheduleEdit = false
        this.loadSendSchedules()
      } catch (error) {
        this.$store.dispatch('addNotification', {
          type: 'error',
          message: 'Nije uspjelo brisanje rasporeda slanja',
        })
      } finally {
        this.savingSchedule = false
      }
    },
  },
})
</script>
