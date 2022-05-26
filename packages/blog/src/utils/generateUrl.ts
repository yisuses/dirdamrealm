import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

function populateUrl(base: string, path: string, ...params: (Record<string, string | number | boolean> | string)[]) {
  const url = new URL(path, base)
  if (params?.length) {
    params.forEach(p => {
      const parsedParams =
        typeof p === 'string'
          ? p
              .split('&')
              .map(param => {
                const splittedParam = param.split('=')
                return splittedParam.length === 2 ? splittedParam : []
              })
              .filter(a => a.length)
          : Object.entries(p)
      parsedParams.forEach(([key, value]) => {
        if (url.searchParams.has(key)) {
          url.searchParams.set(key, value.toString())
        } else {
          url.searchParams.append(key, value.toString())
        }
      })
    })
  }
  return url.toString()
}

export function apiUrl(path: string, ...params: (Record<string, string | number | boolean> | string)[]) {
  return populateUrl(publicRuntimeConfig.API_URL, path, ...params)
}

export function blogUrl(path: string, locale: string) {
  return `https://eb5d-2-138-152-35.ngrok.io/${locale}${path}`
}
