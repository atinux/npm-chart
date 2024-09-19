import colors from '#tailwind-config/theme/colors'

const rxHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/
function hexToRgb (hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, function (_, r, g, b) {
    return r + r + g + g + b + b
  })

  const result = rxHex.exec(hex)
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : null
}

export default defineNuxtPlugin({
  enforce: 'post',
  setup () {
    const nuxtApp = useNuxtApp()
    const appConfig = useAppConfig()
    const colorMode = useColorMode()
    const options = useRoute().query || {}

    const root = computed(() => {
      const primary: Record<string, string> | undefined = colors[appConfig.ui.primary]
      const gray: Record<string, string> | undefined = colors[appConfig.ui.gray]

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
      watch(root, () => {
        window.localStorage.setItem('nuxt-ui-root', root.value)
      })

      const primary = options.primary || window.localStorage.getItem('nuxt-ui-primary') || appConfig.ui.primary
      if (colors[primary]) {
        appConfig.ui.primary = primary
      }

      const gray = options.gray || window.localStorage.getItem('nuxt-ui-gray') || appConfig.ui.gray
      if (colors[gray]) {
        appConfig.ui.gray = gray
      }

      if (['light', 'dark'].includes(options.theme)) {
        nuxtApp.hook('app:mounted', () => {
          console.log('setting theme', options.theme)
          colorMode.preference = options.theme
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