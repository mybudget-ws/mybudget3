// plugins/tabler.client.ts
import { defineNuxtPlugin } from '#app'
import { Tooltip, Collapse } from '@tabler/core/dist/js/tabler.min.js'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('tooltip', {
    mounted(el, binding) {
      el._tooltip = new Tooltip(el, {
        placement: binding.arg || 'auto',
        title: binding.value,
      })
    },
    unmounted(el) {
      el._tooltip?.dispose()
    }
  })
});
