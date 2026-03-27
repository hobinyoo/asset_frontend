import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateReport, getReports } from '@/api/report'
import type { DailyReport } from '@/types/report'

export const REPORT_KEYS = {
  all: ['reports'] as const,
  list: () => [...REPORT_KEYS.all, 'list'] as const,
}

export const useGetReports = () =>
  useQuery({
    queryKey: REPORT_KEYS.list(),
    queryFn: () => getReports(),
  })

export const useGenerateReport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => generateReport(),
    onSuccess: (newReport: DailyReport) => {
      queryClient.setQueryData(REPORT_KEYS.list(), (old: DailyReport[] | undefined) =>
        old ? [newReport, ...old] : [newReport],
      )
    },
  })
}
