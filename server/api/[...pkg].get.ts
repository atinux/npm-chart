import { z } from 'zod'
import { format, endOfWeek, subWeeks } from 'date-fns'
import { fetchComposerPackage, fetchComposerDownloads } from '../utils/composer'

export default eventHandler(async (event) => {
  const { pkg } = await getValidatedRouterParams(event, z.object({
    pkg: z.string().toLowerCase()
  }).parse)


  // Get end of last week
  const until = format(endOfWeek(subWeeks(new Date(), 1)), 'yyyy-MM-dd')

  // Replace npm package fetching with Packagist API
  const { name, description, homepage, version } = await fetchComposerPackage(event, pkg)
  // Get all time series data for the package on Packagist
  const downloads = await fetchComposerDownloads(event, pkg, until)

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
