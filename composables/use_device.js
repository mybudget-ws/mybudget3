// TODO: Подумать когда-нибудь, нужно ли для продакшена делать вариант 1, или оставить всегда вариант 2.
// NOTE: Вариант 1. Для production.
// export const useDevice = () => {
//  const isMobile = window.innerWidth < 1024;
//  return { isMobile };
// };

// NOTE: Вариант 2. Для development.
// import { ref, computed, onMounted, onUnmounted } from 'vue';

export const useDevice = () => {
  const width = ref(0);
  const isMobile = computed(() => width.value < 1024);

  const updateWidth = () => {
    console.log('update_width');
    width.value = window.innerWidth;
  };

  onMounted(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
  });

  return {
    width,
    isMobile,
  };
};