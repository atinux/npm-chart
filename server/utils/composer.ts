import type { H3Event } from 'h3'
import { object } from 'zod'

export const fetchComposerPackage = defineCachedFunction(async (_event: H3Event, pkg: string) => {
  try {
    const res = await $fetch(`https://packagist.org/packages/${pkg}.json`)
    const packageInfo = res.package

    const version = Object.keys(packageInfo.versions)[1] || "dev-master"

    return {
      name: packageInfo.name,
      description: packageInfo.description,
      version: version,
      homepage: packageInfo.repository
    }
  } catch (error) {
    throw createError({
      statusCode: 404,
      message: 'Package not found'
    })
  }
}, {
  group: 'composer',
  name: 'package',
  getKey: (_event, pkg) => pkg,
  maxAge: 60 * 60, // 1 hour
})

export const fetchComposerDownloads = defineCachedFunction(async (event: H3Event, pkg: string, until: string) => {
  const res = await $fetch(`https://packagist.org/packages/${pkg}/stats/major/all.json`, {
    params: {
      average: 'weekly',
      from: '2024-09-01',
      to: until
    }
  })

//   if (!res.values || !Array.isArray(res.values)) {
//     throw createError({
//       statusCode: 500,
//       message: 'Invalid response from Packagist API'
//     })
//   }

  const versionsOfValues = Object.keys(res.values)
  const lastVersion = versionsOfValues[versionsOfValues.length - 1]
  const values = res.values[lastVersion]
  const dates = res.labels
  const downloads = {}
  for (let i = 0; i < values.length; i++) {
    downloads[dates[i]] = values[i]
  }

  return downloads
}, {
  group: 'composer',
  name: 'downloads',
  getKey: (_event, pkg, until) => `${pkg}-${until}`,
  maxAge: 60 * 60 * 24 * 30, // 1 month
})
