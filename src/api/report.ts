import api from '@/api/axios'

export const generateReport = async () => {
  const { data } = await api.post('/api/reports/generate')
  return data.data
}

export const getReports = async () => {
  const { data } = await api.get('/api/reports')
  return data.data
}

export const getReportByDate = async (date: string) => {
  const { data } = await api.get(`/api/reports/${date}`)
  return data.data
}
