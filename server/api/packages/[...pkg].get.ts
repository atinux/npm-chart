import { z } from 'zod'
import { format, endOfWeek, subWeeks } from 'date-fns'

export default eventHandler(async (event) => {
  const { pkg } = await getValidatedRouterParams(event, z.object({
    pkg: z.string().toLowerCase(),
  }).parse)

  const packages = pkg.split('+').map(p => p.trim()).filter(Boolean)

  const until = format(endOfWeek(subWeeks(new Date(), 1)), 'yyyy-MM-dd')

  const results = await Promise.allSettled(
    packages.map(async (pkgName) => {
      try {
        const { name, description, homepage, version } = await fetchNpmPackage(event, pkgName)
        const downloads = await fetchNpmDownloads(event, pkgName, until)
        const total = Object.entries(downloads).reduce((acc, [, amount]) => acc + amount, 0)

        return {
          name,
          description,
          homepage,
          version,
          total,
          downloads,
        }
      }
      catch (error) {
        return null
      }
    }),
  )

  const packagesData = results
    .map((result) => {
      if (result.status === 'fulfilled' && result.value) {
        return result.value
      }
      return null
    })
    .filter(pkg => pkg !== null)

  if (packagesData.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'No packages found',
    })
  }

  if (packagesData.length === 1) {
    return packagesData[0]
  }

  return packagesData
})
