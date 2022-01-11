declare module 'elegant-threading' {
  function elegantThreading<F>(func: F): (...args: Parameters<F>) => Promise<ReturnType<F>>;

  export default elegantThreading;
}
