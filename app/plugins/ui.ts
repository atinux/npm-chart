import colors from '#tailwind-config/theme/colors'

const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
const HEX_SHORTHAND_REGEX = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
function hexToRgb (hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  hex = hex.replace(HEX_SHORTHAND_REGEX, function (_m: string, r: string, g: string, b: string) {
    return r + r + g + g + b + b
  })

  const result = HEX_REGEX.exec(hex)
  return result
    ? `${parseInt(result[1]!, 16)} ${parseInt(result[2]!, 16)} ${parseInt(result[3]!, 16)}`
    : null
}

export default defineNuxtPlugin({
  enforce: 'post',
  setup () {
    const nuxtApp = useNuxtApp()
    const appConfig = useAppConfig()
    const colorMode = useColorMode()
    const options = useRoute().query as Record<string, string>

    const root = computed(() => {
      const primary = colors[appConfig.ui.primary as keyof typeof colors]
      const gray = colors[appConfig.ui.gray as keyof typeof colors]

      return `:root {
        ${Object.entries(primary || colors.green).map(([key, value]) => `--color-primary-${key}: ${hexToRgb(value)};`).join('\n')}
        --color-primary-DEFAULT: var(--color-primary-500);

        ${Object.entries(gray || colors.cool).map(([key, value]) => `--color-gray-${key}: ${hexToRgb(value)};`).join('\n')}
        }

        .dark {
          --color-primary-DEFAULT: var(--color-primary-400);
        }
        `
    })

    if (import.meta.client) {
      watch(root, (newValue: string) => {
        window.localStorage.setItem('nuxt-ui-root', newValue)
      })

      const primary = options.primary || window.localStorage.getItem('nuxt-ui-primary') || appConfig.ui.primary
      if (colors[primary as keyof typeof colors]) {
        appConfig.ui.primary = primary
      }

      const gray = options.gray || window.localStorage.getItem('nuxt-ui-gray') || appConfig.ui.gray
      if (colors[gray as keyof typeof colors]) {
        appConfig.ui.gray = gray
      }

      if(['light', 'dark'].includes(options.theme || '')) {
        nuxtApp.hook('app:mounted', () => {
          colorMode.preference = options.theme!
        })
      }
    }
    if (import.meta.server) {
      useHead({
        script: [
          {
            innerHTML: `
                if (localStorage.getItem('nuxt-ui-root')) {
                  document.querySelector('style#nuxt-ui-colors').innerHTML = localStorage.getItem('nuxt-ui-root')
                }`.replace(/\s+/g, ' '),
            type: 'text/javascript',
            tagPriority: -1
          }
        ]
      })
    }
  }
})