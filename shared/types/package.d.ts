type Period = 'weekly' | 'monthly'

/** 
 * @example
 * {
 *   "2022-01-01": {
 *     "vue": 100,
 *     "react": 10
 *   },
 *   "2022-01-02": {
 *     "vue": 200,
 *     "react": 34
 *   }
 * }
 * 
 */
type PackageDownloadsByDate = Record<string, Record<string, number>>