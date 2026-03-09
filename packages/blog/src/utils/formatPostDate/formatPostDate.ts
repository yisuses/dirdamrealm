export const formatPostDate = (publishedAt: string) => {
  const [datePart] = publishedAt.split('T')
  const [year, month, day] = datePart.split('-')

  if (!year || !month || !day) {
    return datePart
  }

  return `${day}.${month}.${year}`
}
