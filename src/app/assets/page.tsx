import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query_client'
import { ASSET_KEYS } from '@/queries/asset'
import { getDashboardSummary, getDashboardChart } from '@/api/asset'
import DashboardView from '@/components/asset/dashboard_view'

export default async function DashboardRootPage() {
  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ASSET_KEYS.dashboardSummary(),
      queryFn: getDashboardSummary,
    }),
    queryClient.prefetchQuery({
      queryKey: ASSET_KEYS.dashboardChart(),
      queryFn: getDashboardChart,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  )
}
