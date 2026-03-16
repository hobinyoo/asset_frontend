import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getInvestments } from '@/api/investment'
import { INVESTMENT_KEYS } from '@/queries/investment'
import InvestmentTable from '@/components/investment/investment_table'
import { getQueryClient } from '@/lib/query_client'

export default async function InvestmentsPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: INVESTMENT_KEYS.list({ page: 0, size: 10 }), // 맞춰주기
    queryFn: () => getInvestments({ page: 0, size: 10 }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvestmentTable />
    </HydrationBoundary>
  )
}
