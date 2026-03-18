import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import AssetTable from '@/components/asset/asset_table'
import { getQueryClient } from '@/lib/query_client'
import { ASSET_KEYS } from '@/queries/asset'
import { getAssets } from '@/api/asset'

export default async function AssetsTablePage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: ASSET_KEYS.list(0),
    queryFn: () => getAssets(0, 10),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssetTable />
    </HydrationBoundary>
  )
}
