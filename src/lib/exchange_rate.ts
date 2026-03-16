export const getUsdToKrw = async (): Promise<number> => {
  const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW')
  const data = await res.json()
  return data.rates.KRW as number
}
