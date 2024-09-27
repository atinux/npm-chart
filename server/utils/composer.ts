import type { H3Event } from 'h3'
import { object } from 'zod'

export const fetchComposerPackage = defineCachedFunction(async (_event: H3Event, pkg: string) => {
  try {
    const res = await $fetch(`https://packagist.org/packages/${pkg}.json`)
    const packageInfo = res.package

    const versions = Object.keys(packageInfo.versions)
    const version = versions.length == 0 ? "dev-master" : (versions[0] == "dev-master" ? versions[1] : versions[0])

    return {
      name: packageInfo.name,
      description: packageInfo.description,
      version: version,
      homepage: packageInfo.repository,
      total: packageInfo.downloads.total
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
  const res = await $fetch(`https://packagist.org/packages/${pkg}/stats/all.json`, {
    params: {
      average: 'monthly',
      from: '2012-03-01', // When Packagist came to life
      to: until
    }
  })

  if (!res.values || typeof res.values !== 'object') {
    throw createError({
      statusCode: 500,
      message: 'Invalid response from Packagist API'
    })
  }

  const dates = res.labels
  const values = Object.values(res.values)[0]
  const downloads = {}
  for (let i = 0; i < dates.length; i++) {
    downloads[dates[i]] = values[i]
  }

  return downloads
}, {
  group: 'composer',
  name: 'downloads',
  getKey: (_event, pkg, until) => `${pkg}-${until}`,
  maxAge: 60 * 60 * 24 * 30, // 1 month
})
