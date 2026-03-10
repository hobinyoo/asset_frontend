import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getDebts } from '@/api/debt'
import { DEBT_KEYS } from '@/queries/debt'
import DebtTable from '@/components/debt/debt_table'
import { getQueryClient } from '@/lib/query_client'

export default async function DebtsPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: DEBT_KEYS.list(0),
    queryFn: () => getDebts(0, 10),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DebtTable />
    </HydrationBoundary>
  )
}
