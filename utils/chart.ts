interface DownloadData {
  [date: string]: number;
}

interface ChartOptions {
  width?: number;
  height?: number;
  darkMode?: boolean;
}

interface DataPoint {
  date: Date;
  downloads: number;
}

export async function renderChartToSVG(downloadData: DownloadData, options: ChartOptions = {}): Promise<string> {
  const { width = 680, height = 400 } = options

  // Prepare data - format dates and calculate scales
  const data: DataPoint[] = Object.values(downloadData).map(({ date, amount }) => ({
    date: new Date(date),
    downloads: amount
  })).sort((a, b) => a.date.getTime() - b.date.getTime())

  // Calculate scales manually
  const dateRange: [Date, Date] = [data[0].date, data[data.length - 1].date]
  const maxDownloads: number = Math.max(...data.map(d => d.downloads))

  // Ensure bottom of chart starts from 0
  const valueRange: [number, number] = [0, maxDownloads * 1.05] // Add 5% padding at the top

  // Generate path for the line
  const pathData: string = generateLinePath(data, width, height, dateRange, valueRange)

  // Generate path for the area
  const areaData: string = generateAreaPath(data, width, height, dateRange, valueRange)

  // Colors based on reference image
  const primaryColor: string = 'rgb(255, 153, 0)' // Orange color
  const bgColor: string = '#ffffff' // White background
  const gridColor: string = '#e5e5e5' // Light gray for grid

  // Generate simplified SVG with fewer elements
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <!-- Minimal grid lines -->
    ${generateGridLines(width, height, 10, gridColor)}

    <!-- Area fill under the line -->
    <path d="${areaData}" fill="${primaryColor}" opacity="0.1" />

    <!-- Line -->
    <path d="${pathData}" stroke="${primaryColor}" stroke-width="3" fill="none" />
  </svg>`

  return svg
}

function generateLinePath(
  data: DataPoint[],
  width: number,
  height: number,
  dateRange: [Date, Date],
  valueRange: [number, number]
): string {
  const padding = { left: 40, right: 20, top: 20, bottom: 40 }

  const xScale = (date: Date): number => {
    const percent = (date.getTime() - dateRange[0].getTime()) / (dateRange[1].getTime() - dateRange[0].getTime())
    return padding.left + percent * (width - padding.left - padding.right)
  }

  const yScale = (value: number): number => {
    const percent = (value - valueRange[0]) / (valueRange[1] - valueRange[0])
    return height - padding.bottom - percent * (height - padding.top - padding.bottom)
  }

  // Simplify the data points to reduce complexity
  // Take fewer points if we have a lot of data
  const simplifiedData = simplifyData(data, 100); // Limit to ~50 points max

  // Use a curve for smoother lines with fewer points
  let path = '';

  for (let i = 0; i < simplifiedData.length; i++) {
    const x = xScale(simplifiedData[i].date)
    const y = yScale(simplifiedData[i].downloads)

    if (i === 0) {
      path += `M${x},${y}`
    } else {
      // Simpler line segments instead of curves to reduce complexity
      path += ` L${x},${y}`
    }
  }

  return path;
}

// Helper function to reduce the number of data points
function simplifyData(data: DataPoint[], maxPoints: number): DataPoint[] {
  if (data.length <= maxPoints) return data;

  const step = Math.ceil(data.length / maxPoints);
  const result: DataPoint[] = [];

  // Always include first and last points
  result.push(data[0]);

  for (let i = step; i < data.length - step; i += step) {
    result.push(data[i]);
  }

  result.push(data[data.length - 1]);

  return result;
}

function generateAreaPath(
  data: DataPoint[],
  width: number,
  height: number,
  dateRange: [Date, Date],
  valueRange: [number, number]
): string {
  const padding = { left: 40, right: 20, top: 20, bottom: 40 }

  const xScale = (date: Date): number => {
    const percent = (date.getTime() - dateRange[0].getTime()) / (dateRange[1].getTime() - dateRange[0].getTime())
    return padding.left + percent * (width - padding.left - padding.right)
  }

  const yScale = (value: number): number => {
    const percent = (value - valueRange[0]) / (valueRange[1] - valueRange[0])
    return height - padding.bottom - percent * (height - padding.top - padding.bottom)
  }

  // Simplify the data points to reduce complexity
  const simplifiedData = simplifyData(data, 50); // Use the same simplification as the line

  // Start at the bottom left
  let path = `M${xScale(simplifiedData[0].date)},${height - padding.bottom} `

  // Add line segments for the top of the area (simplified)
  for (let i = 0; i < simplifiedData.length; i++) {
    const x = xScale(simplifiedData[i].date)
    const y = yScale(simplifiedData[i].downloads)
    path += ` L${x},${y}`
  }

  // Go to the bottom right and back to start
  path += ` L${xScale(simplifiedData[simplifiedData.length - 1].date)},${height - padding.bottom} Z`

  return path
}

function generateGridLines(width: number, height: number, count: number, color: string): string {
  const padding = { left: 40, right: 20, top: 20, bottom: 40 }
  let lines = ''

  // Reduce the number of grid lines - only add every other line
  // Horizontal grid lines - reduce count
  const reducedCount = Math.min(10, count);
  for (let i = 0; i <= reducedCount; i++) {
    const y = padding.top + (i * (height - padding.top - padding.bottom) / reducedCount)
    lines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${color}" stroke-width="1" />`
  }

  // Vertical grid lines - reduce count
  const verticalCount = Math.min(10, Math.floor((width - padding.left - padding.right) / 100))
  for (let i = 0; i <= verticalCount; i++) {
    const x = padding.left + (i * (width - padding.left - padding.right) / verticalCount)
    lines += `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}" stroke="${color}" stroke-width="1" />`
  }

  return lines
}

function generateDataPoints(
  data: DataPoint[],
  width: number,
  height: number,
  dateRange: [Date, Date],
  valueRange: [number, number],
  color: string
): string {
  // For the clean look in your reference, we'll skip rendering individual data points
  return ''

  /*
  // Uncomment this if you want to add data points
  const padding = { left: 40, right: 20, top: 20, bottom: 40 }

  const xScale = (date: Date): number => {
    const percent = (date.getTime() - dateRange[0].getTime()) / (dateRange[1].getTime() - dateRange[0].getTime())
    return padding.left + percent * (width - padding.left - padding.right)
  }

  const yScale = (value: number): number => {
    const percent = (value - valueRange[0]) / (valueRange[1] - valueRange[0])
    return height - padding.bottom - percent * (height - padding.top - padding.bottom)
  }

  return data.map(d => {
    const x = xScale(d.date)
    const y = yScale(d.downloads)
    return `<circle cx="${x}" cy="${y}" r="3" fill="${color}" />`
  }).join('')
  */
}
