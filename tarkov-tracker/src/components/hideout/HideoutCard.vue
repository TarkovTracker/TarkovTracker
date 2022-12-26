<template>
  <v-sheet rounded class="elevation-2 pt-2 corner-highlight-parent" color="rgba(33,33,33,1)">
    <div class="mt-n10">
      <span class="elevation-3 corner-highlight" :class="highlightClasses">
        <img class="pt-0" :src="stationAvatar" width="50" />
      </span>
      <span class="text-left pb-0">
        <v-sheet rounded class="px-3 py-3" style="display: inherit">
          <span class="text-subtitle-1">{{ station.name }}</span>
          <span class="text-caption ml-3">
            <i18n-t keypath="page.hideout.stationcard.level" scope="global"
              :plural="progressStore.stationLevels[props.station.id]['self']">
              <template #level>
                {{ progressStore.stationLevels[props.station.id]['self'] }}
              </template>
            </i18n-t>
          </span>
        </v-sheet>
      </span>
    </div>

    <div class="text-center pa-2 pt-6">
      <div v-if="nextLevel">
        <div class="text-subtitle-1">{{ $t('page.hideout.stationcard.nextlevel') }}</div>
        <div v-for="requirement, rIndex in nextLevel.itemRequirements" :key="rIndex">
          <span class="d-flex align-center justify-center">
            <tarkov-item :item-id="requirement.item.id" :item-name="requirement.item.name"
              :dev-link="requirement.item.link" :wiki-link="requirement.item.wikiLink" :count="requirement.count"
              class="mr-2 d-inline-block" />
          </span>
        </div>
        <div v-for="requirement, rIndex in nextLevel.stationLevelRequirements" :key="rIndex">
          <i18n-t keypath="page.hideout.stationcard.requirements.station" scope="global">
            <template #level>
              {{ requirement.level }}
            </template>
            <template #stationname>
              {{ requirement.station.name }}
            </template>
          </i18n-t>
        </div>
        <div v-for="requirement, rIndex in nextLevel.skillRequirements" :key="rIndex">
          <i18n-t keypath="page.hideout.stationcard.requirements.skill" scope="global">
            <template #level>
              {{ requirement.level }}
            </template>
            <template #skillname>
              {{ requirement.name }}
            </template>
          </i18n-t>
        </div>
        <div v-for="requirement, rIndex in nextLevel.traderRequirements" :key="rIndex">
          <i18n-t keypath="page.hideout.stationcard.requirements.skill" scope="global">
            <template #loyaltylevel>
              {{ requirement.level }}
            </template>
            <template #tradername>
              {{ requirement.trader.name }}
            </template>
          </i18n-t>
        </div>
      </div>
      <div v-else>
        <div class="text-subtitle-1">{{ $t('page.hideout.stationcard.maxlevel') }}</div>
      </div>

    </div>
  </v-sheet>
</template>
<script setup>
import { computed, defineAsyncComponent } from "vue";
import { useProgressStore } from "@/stores/progress";
import { useI18n } from 'vue-i18n'
const TarkovItem = defineAsyncComponent(() =>
  import("@/components/TarkovItem.vue")
)
const props = defineProps({
  station: {
    type: Object,
    required: true,
  },
});
const progressStore = useProgressStore();
const { t } = useI18n({ useScope: 'global' })

const highlightClasses = computed(() => {
  let classes = {}
  if (progressStore.stationLevels[props.station.id]['self'] > 0) {
    classes['highlight-secondary'] = true
  } else {
    classes['highlight-green'] = true
  }
  return classes
})

const nextLevel = computed(() => {
  return props.station.levels.find(level => level.level === progressStore.stationLevels[props.station.id]['self'] + 1) || null
})

const stationAvatar = computed(() => {
  return `/img/hideout/${props.station.id}.png`
})

</script>
<style lang="scss" scoped>
.corner-highlight {
  border-right-style: solid;
  border-right-width: 0px;
  border-bottom-style: solid;
  border-bottom-width: 0px;
  margin: 0px;
  padding: 6px;
  background-clip: padding-box;
  border-radius: 10px 10px 10px 0px;
}

.highlight-secondary {
  background: linear-gradient(135deg, rgba(125, 111, 85, 1) 0%, rgba(172, 157, 128, 1) 35%, rgba(154, 136, 102, 1) 100%);
}

.highlight-green {
  background: linear-gradient(90deg, rgba(1, 36, 0, 0.15) 0%, rgba(15, 121, 9, 0.15) 35%, rgba(0, 83, 0, 0.15) 100%);
}

.corner-highlight-parent {
  //overflow: hidden;
}
</style>