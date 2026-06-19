//export const useDevice = () => {
//  const userAgent = navigator.userAgent;
//  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
//  // NOTE: Можно ещё вот так, пока оставим usergent
//  // const isMobile = window.innerWidth < 768

 // return { isMobile };
//};

import { ref, computed, onMounted, onUnmounted } from 'vue';

export const useDevice = () => {
  const width = ref(0);

  const updateWidth = () => {
    width.value = window.innerWidth;
  };

  onMounted(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
  });

  const isMobile = computed(() => width.value < 1024);

  return {
    width,
    isMobile,
  };
};