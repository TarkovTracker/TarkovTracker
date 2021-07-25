<template>
  <v-container
    id="grid-view"
    fluid
    tag="section"
  >
    <!-- Group Settings -->
    <v-row>
      <v-col
        cols="12"
        xl="12"
      >
        <material-card
          icon="mdi-account-group"
          icon-small
          title="Team Settings"
          color="success"
        >
          <v-card-text>
            <v-container
              class="bgdarken text--primary"
              fluid
            >
              <v-row class="font-weight-bold">
                <v-col cols="3">
                  Teammate's Name:
                </v-col>
                <v-col cols="2">
                  From:
                </v-col>
                <v-col cols="2">
                  Quests:
                </v-col>
                <v-col cols="2">
                  Hide:
                </v-col>
                <v-col cols="3">
                  Remove
                </v-col>
              </v-row>
              <v-row
                v-for="(teammate, index) in $root.team"
                :key="index"
              >
                <v-col cols="3">
                  <span>
                    <teammate-identity :teammate="teammate" />
                  </span>
                </v-col>
                <v-col cols="2">
                  <span>
                    {{ teammate | timeSinceTeammate(nowTime) }}
                  </span>
                </v-col>
                <v-col cols="2">
                  <span v-if="index > 0">
                    {{ teammate.store.get('progress/quests_array').filter(x => x.complete).length || 0 }}/{{ $root.questArray.length }}
                  </span>
                  <span v-else>
                    {{ myCompleted }}
                  </span>
                </v-col>
                <v-col cols="2">
                  <span v-if="teammate.dynamic == true && inLiveTeam && index != 0">
                    <v-switch
                      dense
                      class="mt-0 pt-0"
                      color="objectiveenough"
                      v-model="hiddenTeammates"
                      :value="teammate.id"
                      :label="hiddenTeammates.includes(teammate.id) ? 'Hide' : 'Show'"
                    ></v-switch>
                  </span>
                  <span v-else-if="index == 0">
                    ---
                  </span>
                  <span v-else>
                    Cannot hide static teammates
                  </span>
                </v-col>
                <v-col cols="3">
                  <span v-if="teammate.dynamic == true && inLiveTeam">
                    <span v-if="index === 0">
                      <v-btn
                        outlined
                        elevation="2"
                        small
                        :loading="leavingTeam"
                        @click="leaveTeam()"
                      >
                        <v-icon>mdi-account-multiple-minus</v-icon> Leave Live Team
                      </v-btn>
                    </span>
                    <span v-else>
                      <span v-if="teammate.dynamic == true && $store.get('firesys/team@owner') == $store.get('app/user_auth@uid')">
                        <v-btn
                          outlined
                          elevation="2"
                          :loading="kickingTeam[teammate.id]"
                          small
                          @click="kickTeammate(teammate)"
                        >
                          <v-icon>mdi-account-multiple-minus</v-icon> Kick Live Teammate
                        </v-btn>
                      </span>
                      <span v-else>
                        Cannot Remove Live Teammate
                      </span>
                    </span>
                  </span>
                  <span v-else>
                    <span v-if="index > 0">
                      <v-btn
                        outlined
                        elevation="2"
                        small
                        @click="removeStaticTeammate(teammate.name)"
                      >
                        <v-icon>mdi-account-minus</v-icon> Remove
                      </v-btn>
                    </span>
                    <span v-else>
                      Cannot remove yourself!
                    </span>
                  </span>
                </v-col>
              </v-row>
            </v-container>
            <span v-if="inLiveTeam">
              <v-divider
                inset
                class="mt-4 mx-3"
              />
              <v-container fluid>
                <v-row
                  align="center"
                  class="mt-4"
                >
                  <v-col
                    cols="4"
                    class="text-center"
                  >
                    <v-icon>mdi-account-circle</v-icon> <teammate-identity :teammate="$root.team.filter(x => x.id == $store.get('firesys/team@owner'))[0]" />'s Team
                  </v-col>
                  <v-col
                    cols="4"
                    class="text-center"
                  >
                    <v-icon>mdi-account-group</v-icon> {{ `${$store.get('firesys/team@members').length || 0}/${$store.get('firesys/team@maximumMembers') || ''}` }} Live Team Members
                  </v-col>
                  <v-col
                    cols="4"
                    class="text-center"
                  >
                    <v-icon>mdi-calendar-clock</v-icon> Created {{ $store.get('firesys/team@createdAt').toDate() | timeSince(nowTime) || '' }}
                  </v-col>
                </v-row>
              </v-container>
            </span>
            <v-divider
              inset
              class="mt-4 mx-3"
            />
            <v-container fluid>
              <v-row align="center">
                <v-col cols="2">
                  <v-text-field
                    v-model.lazy="shareName"
                    class="mb-n3"
                    :label="shareName ? 'Your Display Name' : 'Choose a Display Name'"
                    type="undefined"
                  />
                </v-col>
                <v-col cols="10">
                  <v-container fluid>
                    <v-row
                      v-if="inLiveTeam"
                      align="center"
                    >
                      <v-col
                        cols="3"
                        class="text-right"
                      >
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <span
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-icon dense>mdi-help-circle</v-icon>Live Team Invite
                            </span>
                          </template>
                          <span>A URL that will allow other teammates using an account on TarkovTracker to join your live team</span>
                        </v-tooltip>
                      </v-col>
                      <v-col cols="8">
                        <v-text-field
                          v-model="streamerLink"
                          class="mb-n3"
                          label="Live Team Invite URL"
                          prepend-inner-icon="mdi-link-lock"
                          type="undefined"
                        />
                      </v-col>
                      <v-col cols="1">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              outlined
                              elevation="2"
                              small
                              v-bind="attrs"
                              @click="copyLiveShareURL()"
                              v-on="on"
                            >
                              <v-icon>mdi-clipboard-file-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>Copy Share URL</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                    <v-row align="center">
                      <v-col
                        cols="3"
                        class="text-right"
                      >
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <span
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-icon dense>mdi-help-circle</v-icon>Static Share URL
                            </span>
                          </template>
                          <span>A URL that contains a static copy of your progress, to share with teammates who aren't using an account on TarkovTracker</span>
                        </v-tooltip>
                      </v-col>
                      <v-col cols="8">
                        <v-text-field
                          v-model="shareURL"
                          class="mb-n3"
                          :label="shareURL ? 'Static Share URL' : 'Username Required!'"
                          prepend-inner-icon="mdi-link"
                          type="undefined"
                        />
                      </v-col>
                      <v-col cols="1">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              outlined
                              elevation="2"
                              small
                              v-bind="attrs"
                              @click="copyShareURL()"
                              v-on="on"
                            >
                              <v-icon>mdi-clipboard-file-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>Copy Share URL</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-switch
              v-model="useTeammates"
              :label="`${useTeammates ? 'Show Team Quests' : 'Hide Team Quests'}`"
              class="ml-4"
            />
            <v-switch
              v-model="useTeamObjectives"
              :disabled="!useTeammates"
              :label="`${useTeamObjectives ? 'Show Team Objectives' : 'Hide Team Objectives'}`"
              class="ml-4"
            />
            <v-btn
              v-if="canMakeTeam"
              outlined
              elevation="2"
              class="ma-3"
              :loading="creatingTeam"
              @click="createTeam()"
            >
              <v-icon>mdi-account-group</v-icon> Create Live Team
            </v-btn>
            <v-btn
              v-if="inLiveTeam"
              outlined
              elevation="2"
              class="ma-3"
              :loading="leavingTeam"
              @click="leaveTeam()"
            >
              <v-icon>mdi-account-multiple-minus</v-icon> Leave Live Team
            </v-btn>
            <v-btn
              v-if="!$store.get('app/user_auth')"
              outlined
              elevation="2"
              class="ma-3"
              to="/login/"
            >
              <v-icon>mdi-fingerprint</v-icon> Log In To Enable Live Teams
            </v-btn>
          </v-card-actions>
        </material-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        class="xs"
        xl="4"
        md="6"
        sm="12"
      >
        <material-card
          icon="mdi-content-save"
          icon-small
          title="Progress Export"
          color="info"
        >
          <v-card-text>
            <v-text-field
              v-model="dataExport"
              readonly
              type="text"
              placeholder="Click 'Generate & Copy' to create an export string"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn
              outlined
              elevation="2"
              @click="updateExport()"
            >
              <v-icon>mdi-clipboard-file-outline</v-icon> Generate & Copy
            </v-btn>
          </v-card-actions>
        </material-card>
      </v-col>
      <v-col
        class="xs"
        xl="4"
        md="6"
        sm="12"
      >
        <material-card
          icon="mdi-content-save"
          icon-small
          title="Progress Import"
          color="warning"
        >
          <v-card-text>
            <v-text-field
              v-model="dataImport"
              type="text"
              placeholder="WARNING: This will overwrite your saved data"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn
              outlined
              elevation="2"
              @click="importData()"
            >
              <v-icon>mdi-content-save-edit</v-icon> Import & Overwrite
            </v-btn>
          </v-card-actions>
        </material-card>
      </v-col>
      <v-col
        class="xs"
        xl="4"
        md="6"
        sm="12"
      >
        <material-card
          icon="mdi-alert"
          icon-small
          title="Reset Progression"
          color="objectiveuncomplete"
        >
          <v-card-text>
            <v-text-field
              v-model="confirmText"
              :label="`Please enter '${confirmSuccessText}' to confirm`"
              type="text"
              :error="confirmError"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn
              class="objectiveuncomplete"
              @click="resetData()"
            >
              <v-icon>mdi-alert</v-icon> Reset Progression
            </v-btn>
          </v-card-actions>
        </material-card>
      </v-col>
      <v-col
        class="xs"
        xl="12"
        md="12"
        sm="12"
        v-if="this.$store.get('app/user_auth@uid')"
      >
        <material-card
          icon="mdi-api"
          icon-small
          title="TarkovTracker API (BETA)"
          color="secondary"
        >
          <v-card-text>
            Create access tokens so external tools can utilize your TarkovTracker progress data to provide you information tailored to your current progress. This feature is currently in BETA.
            <v-container
              class="bgdarken text--primary mt-2"
              fluid
              v-if="!streamerMode"
            >
              <v-data-table
                dense
                :headers="tokenHeaders"
                :items="firesys ? firesys.tokens : [] || []"
                item-key="token"
                disable-pagination
                hide-default-footer
              >
                <template v-slot:item.permissions="{ item }">
                    <span class="font-weight-bold" v-for="(permission, permIndex) in item.permissions">
                      {{ availablePermissions[permission].title }}{{ permIndex < item.permissions.length - 1 ? ',' : '' }}
                    </span>
                </template>
                <template v-slot:item.token="{ item }">
                    <span class="font-weight-bold">
                      {{ item.token.substring(0,item.token.length-6).replace(/./g, '*') }}{{ item.token.substring(item.token.length-6) }}
                    </span>
                    <v-btn
                      outlined
                      elevation="2"
                      small
                      @click="copyToClipboard(item.token)"
                    >
                      <v-icon>mdi-clipboard-file-outline</v-icon>
                    </v-btn>
                </template>
                <template v-slot:item.createdAt="{ item }">
                    <span class="font-weight-bold">
                      {{ (new Date(item.createdAt.seconds * 1000)) | timeSince(nowTime) }}
                    </span>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn
                      outlined
                      elevation="2"
                      :loading="revokingToken[item.token]"
                      small
                      @click="revokeToken(item.token)"
                    >
                      <v-icon>mdi-key-remove</v-icon> Revoke Token
                    </v-btn>
                </template>
              </v-data-table>
            </v-container>
            <v-container
              class="bgdarken text--primary mt-2"
              fluid
              v-else
            >
              <v-row class="font-weight-bold text-center">
                  <v-col>
                    Tokens Hidden for Streamer Mode
                  </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-container fluid>
                    <v-row
                      align="center"
                    >
                      <v-col
                        cols="auto"
                        class="text-right"
                      >
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <span
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-icon dense>mdi-help-circle</v-icon>Note
                            </span>
                          </template>
                          <span>A personal note about what you're using the token for, so that you can easily identify tokens to revoke in the future</span>
                        </v-tooltip>
                      </v-col>
                      <v-col>
                        <v-text-field
                          v-model="apiTokenNote"
                          class="mb-n3"
                          label=""
                          placeholder="This token is for..."
                          color="objectiveenough"
                          prepend-inner-icon="mdi-notebook"
                          type="undefined"
                          dense
                        />
                      </v-col>
                      <v-col cols="auto">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              outlined
                              elevation="2"
                              v-bind="attrs"
                              @click="createToken()"
                              :loading="creatingToken"
                              :disabled="!tokenCreateEnabled"
                              v-on="on"
                            >
                              <v-icon>mdi-key-plus</v-icon> Create Token
                            </v-btn>
                          </template>
                          <span>Create new API Token</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                    <v-row align="center">
                      <v-col cols="auto">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <span
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-icon dense>mdi-help-circle</v-icon>Permissions
                            </span>
                          </template>
                          <span>The types of data or actions this token can perform on your behalf</span>
                        </v-tooltip>
                      </v-col>
                      <v-col cols="auto" v-for="permission in Object.keys(availablePermissions)">
                        <v-tooltip top>
                          <template v-slot:activator="{ on, attrs }">
                            <span
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-checkbox
                                v-model="apiSelectedPermissions"
                                :label="availablePermissions[permission].title"
                                :value="permission"
                                color="objectiveenough"
                                dense
                              ></v-checkbox>
                            </span>
                          </template>
                          <span>{{ availablePermissions[permission].description }}</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </v-container>
          </v-card-actions>
        </material-card>
      </v-col>
      <v-col
        class="xs"
        xl="4"
        md="6"
        sm="12"
      >
        <material-card
          icon="mdi-brightness-6"
          icon-small
          title="Theme"
          color="info"
        >
          <v-card-text>
            <v-switch
              v-model="darkMode"
              :label="`${$vuetify.theme.dark ? 'Dark Mode' : 'Light Mode'}`"
              class="ml-4"
            />
            <v-select
              v-model="selectedFont"
              :items="fontOptions"
              label="Font"
              item-text="title"
              item-value="value"
              color="white"
              item-color="white"
              dense
              outlined
            ></v-select>
          </v-card-text>
        </material-card>
      </v-col>
      <v-col
        class="xs"
        xl="4"
        md="6"
        sm="12"
      >
        <material-card
          icon="mdi-brightness-6"
          icon-small
          title="Game Edition"
          color="info"
        >
          <v-card-text>
            <p>Additional data may be computed from this information (e.g. trader reputation).</p>
            <v-select
              v-model="selectedGameEdition"
              :items="gameEditions"
              label="Select game edition"
              item-text="title"
              item-value="value"
              color="white"
              item-color="white"
              dense
              outlined
            ></v-select>
          </v-card-text>
        </material-card>
      </v-col>
      <v-col
        class="xs"
        xl="4"
        md="6"
        sm="12"
      >
        <material-card
          icon="mdi-eye"
          icon-small
          title="Streamer Mode"
          color="warning"
          v-if="this.$store.get('app/user_auth@uid')"
        >
          <v-card-text>
            Hides your Live Team URL so prying eyes can't get your room code. Remember: Don't open team invite links on stream, and advise others you give the link to the same. If you need a fresh room code, simply leave the team and start a new one.
            <v-switch
              v-model="streamerMode"
              :label="`${streamerMode ? 'Streamer Mode On' : 'Streamer Mode Off'}`"
              class="ml-4"
            />
          </v-card-text>
        </material-card>
      </v-col>
      <v-col
        class="xs"
        xl="4"
        md="6"
        sm="12"
        v-if="this.$store.get('app/user_auth@uid')"
      >
        <material-card
          icon="mdi-account-remove"
          icon-small
          title="Delete Account"
          color="objectiveuncomplete"
        >
          <v-card-text>
            This will delete your TarkovTracker account, and delete all data we have stored for you. You may need to log out and back in before deleting your account to refresh authentication with your account provider.
            <v-text-field
              v-model="deleteConfirmText"
              :label="`Please enter '${deleteSuccessText}' to confirm`"
              type="text"
              :error="deleteConfirmError"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn
              class="objectiveuncomplete"
              @click="deleteAccount()"
            >
              <v-icon>mdi-delete</v-icon> Delete Account
            </v-btn>
          </v-card-actions>
        </material-card>
      </v-col>
    </v-row>
    <material-snackbar
      v-if="importNotify !== false"
      v-model="importNotify"
      type="info"
      v-bind="{
        ['bottom']: true,
        ['center']: true
      }"
    >
      Imported progress data from {{ importTime | timeSince(nowTime) }}
    </material-snackbar>
    <material-snackbar
      v-if="resetNotify !== false"
      v-model="resetNotify"
      type="info"
      v-bind="{
        ['bottom']: true,
        ['center']: true
      }"
    >
      Progress data has been reset
    </material-snackbar>
    <material-snackbar
      v-if="joiningTeam !== false"
      v-model="joiningTeam"
      type="info"
      v-bind="{
        ['bottom']: true,
        ['center']: true,
        timeout: -1,
        icon: false,
      }"
    >
      <v-progress-circular
        indeterminate
        color="secondary"
      />
      Attempting to join live team
    </material-snackbar>
    <material-snackbar
      v-if="joinFullNotify !== false"
      v-model="joinFullNotify"
      type="failure"
      v-bind="{
        ['bottom']: true,
        ['center']: true,
        timeout: 10000,
      }"
    >
      The Live Team is currently full!
    </material-snackbar>
    <material-snackbar
      v-if="joinAuthNotify !== false"
      v-model="joinAuthNotify"
      type="failure"
      v-bind="{
        ['bottom']: true,
        ['center']: true,
        timeout: -1,
      }"
    >
      You need to be logged in to join a live team
    </material-snackbar>
  </v-container>
</template>
<script>
  import moment from 'moment';
  import hideoutFunctions from '../functions/hideoutFunctions';

  export default {
    name: 'SettingsView',
    components: {
    },
    data () {
      return {
        dataExport: '',
        dataImport: '',
        confirmText: '',
        confirmError: false,
        confirmSuccessText: 'Reset my progress',
        deleteConfirmText: '',
        deleteConfirmError: false,
        deleteSuccessText: 'Delete my account',

        importTime: false,
        resetNotify: false,
        importNotify: false,
        joinAuthNotify: false,
        joinFullNotify: false,

        creatingTeam: false,
        leavingTeam: false,
        joiningTeam: false,
        kickingTeam: {},
        creatingToken: false,

        apiTokenNote: '',
        apiSelectedPermissions: [],

        revokingToken: {},

        availablePermissions: {
          'GP': {
            title: 'Get Progression',
            description: 'Allows access to read your general progression information, including your TarkovTracker display name, quest progress, hideout progress'
          },
          'TP': {
            title: 'Get Team Progression',
            description: 'Allows access to read a virtual copy of your team\'s progress, including display names, quest, and hideout progress'
          },
          'WP': {
            title: 'Write Progression',
            description: 'Allows access to update your TarkovTracker progress data on your behalf'
          }
        },

        tokenHeaders: [
          {
            text: 'Note',
            align: 'start',
            sortable: false,
            value: 'note',
          },
          {
            text: 'Permissions',
            align: 'end',
            sortable: false,
            value: 'permissions',
          },
          {
            text: 'Token',
            align: 'center',
            sortable: false,
            value: 'token',
          },
          {
            text: '# Calls',
            align: 'end',
            sortable: true,
            value: 'calls',
          },
          {
            text: 'Created',
            align: 'end',
            sortable: true,
            value: 'createdAt',
          },
          {
            text: 'Actions',
            align: 'end',
            sortable: false,
            value: 'actions',
          },
        ],
        gameEditions: [
          { title: 'Standard Edition', value: 1 },
          { title: 'Left Behind Edition', value: 2 },
          { title: 'Prepare for Escape Edition', value: 3 },
          { title: 'Edge of Darkness Limited Edition', value: 4 },
        ],
        fontOptions: [
          { title: 'Share Tech Mono', value: 0 },
          { title: 'Roboto', value: 1 },
        ],
        nowTime: null,
      }
    },
    computed: {
      shareURL () {
        if (this.shareName && !!this.shareName) {
          var teamshareObject = this.$root.generateTeamshareData()
          var encodedShare = `${window.location.href.split('?')[0]}?teamshare=${encodeURIComponent(this.packExport(teamshareObject))}&c=${encodeURIComponent(this.myCompleted)}`
          return encodedShare
        } else {
          return ''
        }
      },
      liveShareURL () {
        if (this.$store.get('app/user_auth') &&
          this.$store.get('firesys') &&
          this.$store.get('firesys/team')) {
          return `${window.location.href.split('?')[0]}?team=${encodeURIComponent(this.$store.get('firesys/team@owner'))}&teamcode=${encodeURIComponent(this.$store.get('firesys/team@password'))}`
        }
        return ''
      },
      myCompleted: function () {
        var completedCount = this.questDataDefault.filter((x, y) => this.$store.get('progress/quest_complete', x.id) === true && x.deprecated !== true).length
        var totalCount = this.questDataDefault.filter(x => x.deprecated !== true).length
        return `${completedCount}/${totalCount}`
      },
      inLiveTeam: function () {
        return this.$store.get('app/user_auth') && this.firesys && this.firesys.team != null
      },
      canMakeTeam: function () {
        return this.$store.get('app/user_auth') &&
          (
            !this.inLiveTeam ||
            (this.inLiveTeam && this.firesys.team.owner !== this.$store.get('app/user_auth').uid)
          )
      },
      streamerLink: function () {
        return this.streamerMode ? 'Hidden for Streamer Mode - Copy via button.' : this.liveShareURL
      },
      tokenCreateEnabled: function () {
        return (this.apiTokenNote.length > 0 && this.apiSelectedPermissions.length > 0)
      },
      selectedGameEdition: {
        get () {
          return this.$store.copy('progress/gameEdition') || 1
        },
        set (value) {
          this.$store.set('progress/gameEdition', value);
          for (let level = 1; level <= 4; level++) {
            let stash = hideoutFunctions.getHideoutModule("stash", level);
            if (value >= level && !this.$store.get('progress/hideout_complete', stash.id)) {
              this.$store.set('progress/complete_hideout', stash.id);
              hideoutFunctions.completeModuleObjective(this.$store, "stash", level);
            } else if (value < level && this.$store.get('progress/hideout_complete', stash.id)) {
              this.$store.set('progress/uncomplete_hideout', stash.id);
              hideoutFunctions.uncompleteModuleObjective(this.$store, "stash", level);
            }
          }
        }
      },
      selectedFont: {
        get () {
          return this.$store.copy('app/font') || 0
        },
        set (value) {
          this.$store.set('app/font', value)
        }
      },
      darkMode: {
        get () {
          return this.$store.get('app/dark')
        },
        set (value) {
          this.$vuetify.theme.dark = value
          return this.$store.set('app/dark', value)
        },
      },
      shareName: {
        get () {
          return this.$store.get('progress/shareName')
        },
        set (value) {
          this.$store.set('progress/shareName', value)
        },
      },
      useTeammates: {
        get () {
          return this.$store.copy('user/useTeammates')
        },
        set (value) {
          this.$store.set('user/useTeammates', value)
        },
      },
      useTeamObjectives: {
        get () {
          return this.$store.copy('user/useTeamObjectives') && this.useTeammates
        },
        set (value) {
          this.$store.set('user/useTeamObjectives', value)
        },
      },
      streamerMode: {
        get () {
          return this.$store.copy('user/streamerMode')
        },
        set (value) {
          this.$store.set('user/streamerMode', value)
        },
      },
      firesys: {
        get () {
          return this.$store.copy('firesys')
        },
      },
      hiddenTeammates: {
        get () {
          return this.$store.copy('user/hideTeammates') || []
        },
        set (value) {
          this.$store.set('user/hideTeammates', value)
        },
      },
    },
    watch: {
    },
    mounted () {
      var teamIdUrl = this.$route.query.team
      var teamCodeUrl = this.$route.query.teamcode
      var teamshareUrl = this.$route.query.teamshare
      if (teamIdUrl && teamCodeUrl) {
        if (this.$store.get('app/get_user_auth_uid')) {
          this.joiningTeam = true
          var joinTeam = this.$firebase.functions().httpsCallable('joinTeam')
          joinTeam({ id: teamIdUrl, password: teamCodeUrl })
            .then((result) => {
              this.joiningTeam = false
              if (result.data.error === 'Team is full') {
                this.joinFullNotify = true
              } else {
                this.$store.set('user/useTeammates', true)
                this.$router.push({ path: '/settings' })
              }
            }, this)
        } else {
          this.joinAuthNotify = true
        }
      } else if (teamshareUrl != null) {
        var unpackedTeamshare = this.unpackExport(teamshareUrl)
        this.$store.set('user/write_teamshare', unpackedTeamshare)
        this.$store.set('user/useTeammates', true)
        this.$router.push({ path: '/settings' })
      }

      this.updateNow()
      setInterval(this.updateNow.bind(this) , 1000)
    },
    metaInfo: {
      // Children can override the title.
      title: 'Settings',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Manage your TarkovTracker preferences, or join a team to share your progression' },
      ],
    },
    filters: {
      timeSince: function (timestamp, now) {
        return moment(timestamp).from(now)
      },
      timeSinceTeammate: function (teammate, now) {
        if (teammate.self || teammate.dynamic) {
          return 'Live'
        }else{
          return moment(teammate.exportTime).from(now)
        }
      },
    },
    methods: {
      updateNow () {
        this.nowTime = Date.now()
      },
      unpackExport (encodedExport) {
        var pako = require('pako')
        // eslint-disable-next-line
        var u8_2 = new Uint8Array(atob(encodedExport).split('').map(function (c) {
          return c.charCodeAt(0)
        }))
        return JSON.parse(pako.inflate(u8_2, { to: 'string' }))
      },
      calculateCompletedQuests (teammate) {
        var tempQuests = this.questDataDefault
        var progressQuestArray = teammate.store.get('progress/quests_array')
        return progressQuestArray.filter(y => y.complete === true).length + '/' + tempQuests.filter(x => x.deprecated !== true).length
      },
      generateExportData () {
        var dataExport = {
          version: {
            major: this.$root.$data.overallVersion,
            data: this.$root.$data.dataHash,
          },
          exportTime: Date.now(),
          progress: this.$store.get('progress/export_progress'),
        }
        return dataExport
      },
      packExport (myExport) {
        var pako = require('pako')
        var deflated = String.fromCharCode.apply(null, pako.deflate(JSON.stringify(myExport), { level: 9 }))
        return btoa(deflated)
      },
      updateExport () {
        this.dataExport = this.packExport(this.generateExportData())
        navigator.clipboard.writeText(this.dataExport)
      },
      copyToClipboard(text) {
        navigator.clipboard.writeText(text)
      },
      copyShareURL () {
        if (this.shareURL != null && !!this.shareURL) { navigator.clipboard.writeText(this.shareURL) }
      },
      copyLiveShareURL () {
        if (this.liveShareURL && !!this.liveShareURL) { navigator.clipboard.writeText(this.liveShareURL) }
      },
      createTeam () {
        this.creatingTeam = true
        var createTeam = this.$firebase.functions().httpsCallable('createTeam')
        createTeam()
          .then((result) => {
            // Read result of the Cloud Function.
            this.creatingTeam = false
          }, this)
      },
      leaveTeam () {
        this.leavingTeam = true
        var leaveTeam = this.$firebase.functions().httpsCallable('leaveTeam')
        leaveTeam()
          .then((result) => {
            // Read result of the Cloud Function.
            this.leavingTeam = false
          }, this)
      },
      kickTeammate (teammate) {
        // Since we're making a new field within the object, we need to make it reactive
        this.$set(this.kickingTeam, teammate.id, true)
        // this.kickingTeam[teammate.id] = true
        var kickTeammate = this.$firebase.functions().httpsCallable('kickTeammate')
        kickTeammate({ id: teammate.id })
          .then((result) => {
            // Reactive change the value
            this.$set(this.kickingTeam, teammate.id, false)
          })
      },
      createToken () {
        this.creatingToken = true
        var createToken = this.$firebase.functions().httpsCallable('createToken')
        createToken({ note: this.apiTokenNote, permissions: this.apiSelectedPermissions })
          .then((result) => {
            // Read result of the Cloud Function.
            console.log(result)
            this.creatingToken = false
            if(!result.data.error) {
              this.apiTokenNote = ""
              this.apiSelectedPermissions = []
            }
          }, this)
      },
      revokeToken (token) {
        // Since we're making a new field within the object, we need to make it reactive
        this.$set(this.revokingToken, token, true)
        // this.kickingTeam[teammate.id] = true
        var revokeToken = this.$firebase.functions().httpsCallable('revokeToken')
        revokeToken({ token: token })
          .then((result) => {
            // Reactive change the value
            console.log(result)
            this.$set(this.revokingToken, token, false)
          })
      },
      importData () {
        var dataImport = this.unpackExport(this.dataImport)
        if (dataImport.version) {
          if (dataImport.progress) {
            // Use the vuex import mutation
            this.$store.set('progress/import_progress', dataImport.progress)
          } else if (dataImport.questProgress && dataImport.hideoutProgress) {
            // Use the migration action for the old data storage
            // TODO: REMOVE BY .13 WIPE
            this.$store.set('progress/set_data_version', 0)
            this.$store.set(
              'progress/migrations!',
              {
                questData: dataImport.questProgress,
                hideoutData: dataImport.hideoutProgress,
              },
            )
          }
          // Seems legit

          this.importTime = dataImport.exportTime
          this.importNotify = true
        }
      },
      resetData () {
        if (this.confirmText == this.confirmSuccessText) {
          // WARNING THIS COMLETELY ERASES THE PROGRESS MODULE IN VUEX
          // DONT USE THIS ELSEWHERE IF YOU DONT KNOW WHAT YOU'RE DOING
          this.$store.set('progress/reset_state')
          this.$store.set('user/reset_state')

          this.confirmText = ''
          this.confirmError = false
          this.resetNotify = true
        } else {
          this.confirmError = true
        }
      },
      deleteAccount () {
        if (this.deleteConfirmText == this.deleteSuccessText) {
          // WARNING THIS COMLETELY DELETE THE FIREBASE ACCOUNT, AND WILL IMMEDIATELY TRIGGER DATA DELETION FUNCTION
          var user = this.$firebase.auth().currentUser;
          user.delete().then(function() {
            // User deleted.
            this.deleteConfirmText = ''
            this.deleteConfirmError = false
          }.bind(this)).catch(function(error) {
            this.deleteConfirmError = true
            this.deleteConfirmText = `${error}`
          }.bind(this));
        } else {
          this.deleteConfirmError = true
        }
      },
    },
  }
</script>
