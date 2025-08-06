export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const nuxtApp = useNuxtApp()
    const colorMode = useColorMode()
    const appConfig = useAppConfig()
    const options = useRoute().query as Record<string, string>

    if (import.meta.client) {
      function updateColor(type: 'primary' | 'neutral') {
        const color = options[type] || localStorage.getItem(`nuxt-ui-${type}`)
        if (color) {
          appConfig.ui.colors[type] = color
        }
      }

      function updateBlackAsPrimary() {
        console.log(options)
        const blackAsPrimary = options.blackAsPrimary || localStorage.getItem('nuxt-ui-black-as-primary')
        if (blackAsPrimary) {
          appConfig.theme.blackAsPrimary = blackAsPrimary === 'true'
        }
      }

      updateColor('primary')
      updateColor('neutral')
      updateBlackAsPrimary()

      if(['light', 'dark'].includes(options.theme || '')) {
        nuxtApp.hook('app:mounted', () => {
          colorMode.preference = options.theme!
        })
      }
    }

    if (import.meta.server) {
      useHead({
        script: [{
          innerHTML: `
            let html = document.querySelector('style#nuxt-ui-colors').innerHTML;

            if (localStorage.getItem('nuxt-ui-primary')) {
              const primaryColor = localStorage.getItem('nuxt-ui-primary');
              if (primaryColor !== 'black') {
                html = html.replace(
                  /(--ui-color-primary-\\d{2,3}:\\s*var\\(--color-)${appConfig.ui.colors.primary}(-\\d{2,3}.*?\\))/g,
                  \`$1\${primaryColor}$2\`
                );
              }
            }
            if (localStorage.getItem('nuxt-ui-neutral')) {
              let neutralColor = localStorage.getItem('nuxt-ui-neutral');
              html = html.replace(
                /(--ui-color-neutral-\\d{2,3}:\\s*var\\(--color-)${appConfig.ui.colors.neutral}(-\\d{2,3}.*?\\))/g,
                \`$1\${neutralColor === 'neutral' ? 'old-neutral' : neutralColor}$2\`
              );
            }

            document.querySelector('style#nuxt-ui-colors').innerHTML = html;
            `.replace(/\s+/g, ' '),
          type: 'text/javascript',
          tagPriority: -1
        },  {
          innerHTML: `
            if (localStorage.getItem('nuxt-ui-black-as-primary') === 'true') {
              document.querySelector('style#nuxt-ui-black-as-primary').innerHTML = ':root { --ui-primary: black; } .dark { --ui-primary: white; }';
            } else {
              document.querySelector('style#nuxt-ui-black-as-primary').innerHTML = '';
            }
          `.replace(/\s+/g, ' ')
        }]
      })
    }
  }
})