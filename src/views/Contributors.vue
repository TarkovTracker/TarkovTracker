<template>
  <v-container
    id="grid-view"
    fluid
    tag="section"
  >
    <v-row>
      <v-col
        cols="12"
      >
        <material-card
          title="Patreon Supporters"
          color="success"
        >
          <v-card-text>
            <div>
              Thank you to <span class="font-italic">{{ ttPatronData.join(', ') }}</span> for their support on Patreon! They help pay the base costs of keeping the site available for everyone to use!
            </div>
            <div>
              Patreons cover the costs of domains, hosting, development resources, and other cloud resources to provide TarkovTracker as a free service without ads - if you'd like to help allow us to continue expanding the sites with better services, we'd love your support!
            </div>
          </v-card-text>
        </material-card>
      </v-col>
    </v-row>
    <v-row>
      <div
        class="mx-auto"
        style="text-align: center;"
      >
        <a
          href="https://www.patreon.com/bePatron?u=13444262"
          target="_blank"
        ><img
          src="https://c5.patreon.com/external/logo/become_a_patron_button.png"
          style="height: auto; width: auto;"
        ></a>
      </div>
    </v-row>
    <v-row>
      <v-col
        cols="12"
      >
        <material-card
          title="Contributors"
          color="success"
        >
          <v-card-text>
            <div>
              Thank you to everyone who contributes to the project, from development, to bug reports, to design, and data contribution. More than 50 people to date have contributed in some way to the project. Without the community, TarkovTracker would be a shell of what it is now.
            </div>
            <v-divider class="my-4" />
            <h3>
              <a
                href="https://github.com/TarkovTracker/TarkovTracker"
                class="info-link"
              >TarkovTracker</a> Contributors:
            </h3>
            <v-list>
              <v-list-item
                v-for="contributor in contributorData"
                :key="contributor.title"
                :href="contributor.html_url"
                target="_blank"
              >
                <v-list-item-avatar size="30">
                  <v-img :src="contributor.avatar_url" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="contributor.login" />
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-divider class="my-4" />
            <h3>
              <a
                href="https://github.com/TarkovTracker/tarkovdata"
                class="info-link"
              >tarkovdata</a> Contributors:
            </h3>
            <v-list>
              <v-list-item
                v-for="contributor in tarkovdataContributorData"
                :key="contributor.title"
                :href="contributor.html_url"
                target="_blank"
              >
                <v-list-item-avatar size="30">
                  <v-img :src="contributor.avatar_url" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="contributor.login" />
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <div>
              TarkovTracker Maintains an open data source for Tarkov that it uses and welcomes other tools to utilize & contribute back to. Individuals can help contribute & maintain this data - thank you to everyone helping make open data and tools! Finally - a big thank you to all of the wiki contributors. TarkovTracker is meant to be a fancy todo list to help people progress faster in Tarkov. It would be a tenth as useful without all the invaluable information shared by members & users of the EFT wiki!
            </div>
          </v-card-text>
        </material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        ttPatronData: [],
        contributorData: [],
        tarkovdataContributorData: [],
      }
    },
    computed: {
    },
    async created () {
      // Grab the list of Patrons from the TT Patron endpoint
      const ttPatronResponse = await fetch('https://patrons.tarkovtracker.io/get')
      const ttPatronData = await ttPatronResponse.json()
      this.ttPatronData = ttPatronData.patron_names

      // Grab the list of contributors from TarkovTracker repo
      const contributorResponse = await fetch('https://api.github.com/repos/TarkovTracker/TarkovTracker/contributors')
      const contributorData = await contributorResponse.json()
      this.contributorData = contributorData

      // Grab the list of members of TarkovTracker org to fill in missing contributor since open source
      const orgMemberResponse = await fetch('https://api.github.com/orgs/TarkovTracker/members')
      const orgMemberData = await orgMemberResponse.json()
      
      // Add any org members to contributor list that are missing
      orgMemberData.forEach((member) => {
        if (this.contributorData.filter(contrib => contrib.id == member.id).length == 0) {
          this.contributorData.push(member)
        }
      }, this)

      // Remove any bot accounts
      this.contributorData = contributorData.filter(contrib => contrib.type != "Bot")

      // Grab the list of contributors from tarkovdata repo
      const tarkovdataContributorResponse = await fetch('https://api.github.com/repos/TarkovTracker/tarkovdata/contributors')
      const tarkovdataContributorData = await tarkovdataContributorResponse.json()
      this.tarkovdataContributorData = tarkovdataContributorData
    },
    methods: {
    },
    metaInfo: {
      // Children can override the title.
      title: 'Contributors',
      // Define meta tags here.
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Check out the people who contribute & make TarkovTracker possible - and maybe pitch in yourself!' },
      ],
    },
  }
</script>
