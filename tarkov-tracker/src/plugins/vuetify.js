// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import colors from "vuetify/lib/util/colors";
import { useI18n } from "vue-i18n";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import i18n from "./i18n";

// Vuetify
import { createVuetify } from "vuetify";

const colorTheme = {
  primary: "#0A0A09",
  secondary: "#9A8866",
  secondary_dark: "#2c261c",
  accent: "#242F35",
  tertiary: "#39230a",
  info: "#181817",
  success: "#242F35",
  warning: "#391111",
  complete: "#114200",
  failed: "#ffcccc",
  error: "#FF0000",
  failure: "#391111",
  tasklink: "#00acc1",
};

export default createVuetify({
  global: {
    ripple: false,
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: "trackerTheme",
    themes: {
      trackerTheme: {
        dark: true,
        colors: {
          ...colorTheme,
          link: "#118cf7",
          bgdarken: colors.grey.darken4,
          enough: "#001638",
          questlink: colors.grey.lighten4,
          objectiveahead: "#193011",
          objectivecomplete: "#114200",
          objectiveuncomplete: "#391111",
          objectiveenough: "#2e455a",
          chartbase: "#ffffff",
          sitebackground: "#121212",
          contentbackground: "#1E1E1E",
        },
      },
    },
  },
});
