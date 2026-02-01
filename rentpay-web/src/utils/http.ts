const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (!isRecord(error)) return fallback
  const response = error.response
  if (!isRecord(response)) return fallback
  const data = response.data
  if (!isRecord(data)) return fallback
  const message = data.message
  return typeof message === 'string' && message.length > 0 ? message : fallback
}
