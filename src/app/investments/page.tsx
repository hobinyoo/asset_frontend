import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getInvestments } from '@/api/investment'
import { INVESTMENT_KEYS } from '@/queries/investment'
import InvestmentTable from '@/components/investment/investment_table'
import { getQueryClient } from '@/lib/query_client'

export default async function InvestmentsPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: INVESTMENT_KEYS.list(),
    queryFn: () => getInvestments(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvestmentTable />
    </HydrationBoundary>
  )
}
