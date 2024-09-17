import { z } from 'zod'
import { format, endOfMonth, subMonths } from 'date-fns'

export default eventHandler(async (event) => {
  const { pkg } = await getValidatedRouterParams(event, z.object({
    pkg: z.string().toLowerCase()
  }).parse)

  // Get end of last month
  const until = format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')

  const { name, description, homepage, version } = await fetchNpmPackage(pkg)
  // Get all time series data for the package on npm
  const downloads = await fetchNpmDownloads(pkg, until)

  return {
    name,
    description,
    homepage,
    version,
    downloads
  }
})

async function fetchNpmPackage(pkg: string) {
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
}

async function fetchNpmDownloads(pkg: string, until: string) {
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
}