import api from '@/api/axios'
import type { DataResponse } from '@/types/response'
import type { SnapshotPeriod, SnapshotResponse } from '@/types/snapshot'

export const getSnapshots = async (period: SnapshotPeriod) => {
  const { data } = await api.get<DataResponse<SnapshotResponse[]>>(
    `/api/snapshots?period=${period}`,
  )
  return data.data
}
