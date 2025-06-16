// plugins/tabler.client.ts
import { defineNuxtPlugin } from '#app'
import { Tooltip, Collapse } from '@tabler/core/dist/js/tabler.min.js'

export default defineNuxtPlugin((nuxtApp) => {
  const initTooltips = () => {
    document
      .querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]')
      .forEach(el => {
        // https://github.com/tabler/tabler/blob/main/core/js/src/tooltip.js
        let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          let options = {
            delay: {show: 50, hide: 50},
            html: tooltipTriggerEl.getAttribute("data-bs-html") === "true" || false,
            placement: tooltipTriggerEl.getAttribute('data-bs-placement') || 'auto'
          };
          return new Tooltip(tooltipTriggerEl, options);
        });
      });
  }

  // const initCollapce = () => {
  //   document
  //     .querySelectorAll<HTMLElement>('.collapse')
  //     .forEach(el => {
  //       console.log('collapce', el)
  //       new Collapse(el, { toggle: true });
  //     });
  // }
  // nuxtApp.hook('page:finish', initCollapce)

  // 1) Попробовать сразу (на случай, если плагин загрузился после window.load)
  // initTooltips()

  // 2) После полной загрузки страницы (деферные скрипты уже прогрузились)
  // window.addEventListener('load', initTooltips)

  // 3) И после каждого «финша» SPA-роута
  nuxtApp.hook('page:finish', initTooltips)
})
