// plugins/tabler.client.ts
import { defineNuxtPlugin } from '#app'
import { Tooltip, Collapse } from '@tabler/core/dist/js/tabler.min.js'

const DEFAULT_TOOLTIP_SHOW = 1000;
const DEFAULT_TOOLTIP_HIDE = 100;

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('tooltip', {
    mounted(el, binding) {
      const modifiers = binding.modifiers || {}
      const placement = binding.arg || 'auto'

      let title = ''
      if (typeof binding.value === 'string') {
        title = binding.value
      } else if (typeof binding.value === 'object' && binding.value && binding.value.title) {
        title = binding.value.title
      }

      const options: any = { placement, title }
      if (modifiers.delay) {
        if (typeof binding.value === 'number') {
          options.delay = binding.value
        } else if (typeof binding.value === 'object' && binding.value && binding.value.delay) {
          const d = binding.value.delay
          if (typeof d === 'number') {
            options.delay = {
              show: d,
              hide: d.hide ?? DEFAULT_TOOLTIP_HIDE,
            }
          } else if (typeof d === 'object') {
            options.delay = {
              show: d.show ?? DEFAULT_TOOLTIP_SHOW,
              hide: d.hide ?? DEFAULT_TOOLTIP_HIDE,
            }
          }
        }
      } else {
        options.delay = { show: DEFAULT_TOOLTIP_SHOW, hide: DEFAULT_TOOLTIP_HIDE }
      }

      el._tooltip = new Tooltip(el, options)
    },

    unmounted(el) {
      el._tooltip?.dispose()
    },
  })
});
