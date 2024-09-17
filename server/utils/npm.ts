import type { H3Event } from 'h3'

// https://hub.nuxt.com/docs/features/cache#server-functions-caching
export const fetchNpmPackage = defineCachedFunction(async (_event: H3Event, pkg: string) => {
  try {
    const res = await $fetch<Record<string, Record<string, number>>>('https://registry.npmjs.org/' + pkg)
    return {
      name: res.name,
      description: res.description,
      version: res['dist-tags'].latest,
      homepage: res.homepage
    }
  } catch (error) {
    throw createError({
      statusCode: 404,
      message: 'Package not found'
    })
  }
}, {
  group: 'npm',
  name: 'package',
  getKey: (_event, pkg) => pkg,
  maxAge: 60 * 60, // 1 hour
})

export const fetchNpmDownloads = defineCachedFunction(async (event: H3Event, pkg: string, until: string) => {
  const res = await $fetch<Record<string, Record<string, number>>>('https://npm-stat.com/api/download-counts', {
    query: {
      package: pkg,
      from: '2010-01-01',
      until
    }
  })
  const data = res[pkg] as Record<string, number>

  // Remove firs entries with 0
  for (const date in data) {
    if (data[date] > 0) {
      return data
    }
    delete data[date]
  }
  return data
}, {
  group: 'npm',
  name: 'downloads',
  getKey: (_event, pkg, until) => `${pkg}-${until}`,
  maxAge: 60 * 60 * 24 * 30, // 1 month
})