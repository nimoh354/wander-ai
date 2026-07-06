// src/utils/dateHelpers.js

/**
 * Calculate end date from start date + duration
 */
export const calculateEndDate = (startDate, durationDays) => {
  if (!startDate || !durationDays) return ''
  const date = new Date(startDate)
  date.setDate(date.getDate() + parseInt(durationDays) - 1) // -1 because duration includes start day
  return date.toISOString().split('T')[0]
}

/**
 * Generate array of dates between start and end
 */
export const generateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return []
  
  const dates = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0])
  }
  
  return dates
}

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Check if a date is within a range
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false
  const d = new Date(date)
  const start = new Date(startDate)
  const end = new Date(endDate)
  return d >= start && d <= end
}

/**
 * Get season from date
 */
export const getSeason = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const month = date.getMonth()
  
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Fall'
  return 'Winter'
}