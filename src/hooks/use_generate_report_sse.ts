import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { REPORT_KEYS } from '@/queries/report'
import type { DailyReport, ProgressState } from '@/types/report'

export function useGenerateReportSSE(onComplete: (report: DailyReport) => void) {
  const queryClient = useQueryClient()
  const [isStreaming, setIsStreaming] = useState(false)
  const [progress, setProgress] = useState<ProgressState>({
    phase: 'idle',
    collectResults: [],
    embedCount: 0,
    embedTotal: 0,
  })
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  const start = () => {
    eventSourceRef.current?.close()

    setIsStreaming(true)
    setProgress({ phase: 'collect', collectResults: [], embedCount: 0, embedTotal: 0 })

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reports/generate/stream`,
      { withCredentials: true },
    )
    eventSourceRef.current = eventSource

    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data)

      if (event.type === 'COLLECT' && event.status === 'PROGRESS') {
        setProgress((prev) => ({
          ...prev,
          phase: 'collect',
          collectResults: [
            ...prev.collectResults,
            {
              ticker: event.ticker,
              stockName: event.stockName,
              message: event.message,
            },
          ],
        }))
      }

      if (event.type === 'EMBED') {
        if (event.status === 'START') {
          setProgress((prev) => ({ ...prev, phase: 'embed' }))
        }
        if (event.status === 'PROGRESS') {
          setProgress((prev) => ({
            ...prev,
            embedCount: event.current,
            embedTotal: event.total,
          }))
        }
      }

      if (event.type === 'REPORT' && event.status === 'START') {
        setProgress((prev) => ({ ...prev, phase: 'report' }))
      }

      if (event.type === 'REPORT' && event.status === 'COMPLETE') {
        const newReport = event.data as DailyReport
        queryClient.setQueryData(REPORT_KEYS.list(), (old: DailyReport[] | undefined) => [
          newReport,
          ...(old ?? []),
        ])
        onComplete(newReport)
        setIsStreaming(false)
        setProgress({ phase: 'idle', collectResults: [], embedCount: 0, embedTotal: 0 })
        eventSource.close()
        eventSourceRef.current = null
      }

      if (event.type === 'ERROR') {
        setIsStreaming(false)
        setProgress({ phase: 'idle', collectResults: [], embedCount: 0, embedTotal: 0 })
        eventSource.close()
        eventSourceRef.current = null
      }
    }

    eventSource.onerror = () => {
      setIsStreaming(false)
      setProgress({ phase: 'idle', collectResults: [], embedCount: 0, embedTotal: 0 })
      eventSource.close()
      eventSourceRef.current = null
    }
  }

  return { isStreaming, progress, start }
}