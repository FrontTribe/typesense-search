/**
 * Type declarations for CSS modules
 * This prevents TypeScript errors when importing CSS files
 */

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.sass' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.less' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.scss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.sass' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.module.less' {
  const content: { [className: string]: string }
  export default content
}
