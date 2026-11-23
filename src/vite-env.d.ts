/// <reference types="vite/client" />

/**
 * Vite cho phép nạp file dạng văn bản thô bằng hậu tố `?raw`.
 * Khai báo này để `tsc` hiểu — test đối chiếu dữ liệu với docs/DESIGN.md dùng tới nó.
 */
declare module '*?raw' {
  const content: string;
  export default content;
}
