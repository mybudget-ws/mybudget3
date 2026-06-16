export const useDevice = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  // NOTE: Можно ещё вот так, пока оставим userAgent
  // const isMobile = window.innerWidth < 768

  return { isMobile };
};