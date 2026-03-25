import { useQuery } from '@tanstack/react-query'
import { getSnapshots } from '@/api/snapshot'
import type { SnapshotPeriod } from '@/types/snapshot'

export const SNAPSHOT_KEYS = {
  all: ['snapshots'] as const,
  byPeriod: (period: SnapshotPeriod) => [...SNAPSHOT_KEYS.all, period] as const,
}

export const useSnapshots = (period: SnapshotPeriod) =>
  useQuery({
    queryKey: SNAPSHOT_KEYS.byPeriod(period),
    queryFn: () => getSnapshots(period),
  })
