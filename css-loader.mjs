/**
 * CSS Loader for Node.js ESM
 * This loader handles CSS imports by returning an empty module
 */

export async function resolve(specifier, context, nextResolve) {
  // Handle CSS file imports
  if (
    specifier.endsWith('.css') ||
    specifier.endsWith('.scss') ||
    specifier.endsWith('.sass') ||
    specifier.endsWith('.less') ||
    specifier.endsWith('.module.css') ||
    specifier.endsWith('.module.scss') ||
    specifier.endsWith('.module.sass') ||
    specifier.endsWith('.module.less')
  ) {
    return {
      shortCircuit: true,
      url: new URL('data:text/javascript,export default {}', import.meta.url).href,
    }
  }

  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  // Handle CSS file loads
  if (url.startsWith('data:text/javascript,export default {}')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {}',
    }
  }

  return nextLoad(url, context)
}
