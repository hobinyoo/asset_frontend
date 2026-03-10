import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import ReportPage from '@/components/report/report_page'
import { getQueryClient } from '@/lib/query_client'
import { REPORT_KEYS } from '@/queries/report'
import { getReports } from '@/api/report'

export default async function ReportsPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: REPORT_KEYS.list(),
    queryFn: getReports,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReportPage />
    </HydrationBoundary>
  )
}
