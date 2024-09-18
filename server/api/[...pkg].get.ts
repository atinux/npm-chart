import { z } from 'zod'
import { format, endOfMonth, subMonths } from 'date-fns'

export default eventHandler(async (event) => {
  const { pkg } = await getValidatedRouterParams(event, z.object({
    pkg: z.string().toLowerCase()
  }).parse)

  // Get end of last month
  const until = format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')

  const { name, description, homepage, version } = await fetchNpmPackage(event, pkg)
  // Get all time series data for the package on npm
  const downloads = await fetchNpmDownloads(event, pkg, until)

  const total = Object.entries(downloads).reduce((acc, [_date, amount]) => acc + amount, 0)

  return {
    name,
    description,
    homepage,
    version,
    total,
    downloads
  }
})
