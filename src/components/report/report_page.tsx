'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetReports, REPORT_KEYS } from '@/queries/report'
import { DailyReport } from '@/types/report'

type CollectResult = {
  ticker: string
  stockName: string
  message: string
}

type ProgressState = {
  phase: 'idle' | 'collect' | 'embed' | 'report'
  collectResults: CollectResult[]
  embedCount: number
  embedTotal: number
}

function useGenerateReportSSE(onComplete: (report: DailyReport) => void) {
  const queryClient = useQueryClient()
  const [isStreaming, setIsStreaming] = useState(false)
  const [progress, setProgress] = useState<ProgressState>({
    phase: 'idle',
    collectResults: [],
    embedCount: 0,
    embedTotal: 0,
  })

  const start = () => {
    setIsStreaming(true)
    setProgress({ phase: 'collect', collectResults: [], embedCount: 0, embedTotal: 0 })

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reports/generate/stream`,
      { withCredentials: true },
    )

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
      }

      if (event.type === 'ERROR') {
        setIsStreaming(false)
        setProgress({ phase: 'idle', collectResults: [], embedCount: 0, embedTotal: 0 })
        eventSource.close()
      }
    }

    eventSource.onerror = () => {
      setIsStreaming(false)
      setProgress({ phase: 'idle', collectResults: [], embedCount: 0, embedTotal: 0 })
      eventSource.close()
    }
  }

  return { isStreaming, progress, start }
}

function ReportCard({
  report,
  isSelected,
  onClick,
}: {
  report: DailyReport
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        isSelected
          ? 'border-blue-400 bg-blue-50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{report.reportDate}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {new Date(report.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-gray-500">{report.summaryContent}</p>
    </button>
  )
}

function ReportDetail({ report }: { report: DailyReport }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            📊 {report.reportDate} 데일리 리포트
          </h2>
          <p className="mt-0.5 text-xs text-gray-400">
            생성: {new Date(report.createdAt).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 요약 */}
      <div className="mb-5 rounded-xl bg-yellow-50 p-4">
        <p className="mb-1 text-xs font-semibold text-yellow-600">💬 오늘의 요약</p>
        <p className="whitespace-pre-wrap text-sm text-gray-700">{report.summaryContent}</p>
      </div>

      {/* 전체 리포트 - HTML 렌더링 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500">📋 상세 분석</p>
        <div
          className="report-content rounded-xl bg-gray-50 p-4"
          dangerouslySetInnerHTML={{ __html: report.fullContent }}
        />
      </div>

      <style>{`
        .report-content section {
          margin-bottom: 1.5rem;
        }
        .report-content h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .report-content h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
        }
        .report-content p {
          font-size: 0.875rem;
          line-height: 1.75;
          color: #475569;
          margin-bottom: 0.75rem;
        }
        .report-content .stock-item {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 0.75rem;
          border: 1px solid #e2e8f0;
        }
        .report-content .news::before {
          content: '📰 ';
        }
        .report-content .outlook::before {
          content: '🔭 ';
        }
        .report-content .risk::before {
          content: '⚠️ ';
        }
        .report-content .opportunity::before {
          content: '💡 ';
        }
        .report-content .action p::before {
          content: '✅ ';
        }
        .report-content .recommendation {
          background: #f0fdf4;
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid #bbf7d0;
        }
        .report-content .recommendation h2 {
          border-bottom-color: #bbf7d0;
          color: #166534;
        }
        .report-content .analysis::before {
          content: '📊 ';
        }
        .report-content .recommendation p.recommendation::before {
          content: '🌱 ';
        }
        .report-content strong {
          color: #1e293b;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

export default function ReportPage() {
  const { data: reports, isPending, isError } = useGetReports()
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)

  const sse = useGenerateReportSSE((newReport) => {
    setSelectedReport(newReport)
  })

  const reportList: DailyReport[] = reports ?? []
  const { progress } = sse

  const handleGenerate = () => {
    sse.start()
  }

  const displayReport = selectedReport ?? (reportList.length > 0 ? reportList[0] : null)

  if (isPending) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">로딩 중...</div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-red-400">
        에러가 발생했습니다.
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">데일리 리포트</h1>
          <p className="text-sm text-gray-400">AI가 분석한 투자 종목 리포트</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={sse.isStreaming}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {sse.isStreaming ? '생성 중...' : '🤖 오늘 리포트 생성'}
        </button>
      </div>

      {sse.isStreaming && (
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          {/* 단계 설명 */}
          <p className="mb-3 text-xs font-semibold text-blue-600">
            {progress.phase === 'collect' && '📡 보유 종목 관련 최신 뉴스를 수집하고 있습니다...'}
            {progress.phase === 'embed' &&
              '🧠 수집된 기사를 AI가 투자자 관점으로 요약하고 있습니다...'}
            {progress.phase === 'report' &&
              '📊 수집된 뉴스를 바탕으로 리포트를 생성하고 있습니다...'}
          </p>

          {/* COLLECT 결과 */}
          {progress.collectResults.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs text-gray-500">뉴스 수집 현황</p>
              <div className="space-y-1">
                {progress.collectResults.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-blue-100 py-1 text-xs text-gray-600"
                  >
                    <span className="font-medium">{r.stockName}</span>
                    <span className="text-gray-400">{r.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMBED 진행률 */}
          {progress.phase === 'embed' && progress.embedTotal > 0 && (
            <div className="mb-3">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>기사 요약 중</span>
                <span>
                  {progress.embedCount} / {progress.embedTotal}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-blue-200">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${(progress.embedCount / progress.embedTotal) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {reportList.length === 0 && !sse.isStreaming ? (
        <div className="flex h-60 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 text-gray-400">
          <span className="text-4xl">📭</span>
          <p className="text-sm">아직 리포트가 없습니다</p>
          <button
            onClick={handleGenerate}
            disabled={sse.isStreaming}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            첫 리포트 생성하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            <p className="text-xs font-medium text-gray-400">리포트 목록</p>
            {reportList.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={displayReport?.id === report.id}
                onClick={() => setSelectedReport(report)}
              />
            ))}
          </div>

          <div className="lg:col-span-2">
            {displayReport ? (
              <ReportDetail report={displayReport} />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                리포트를 선택해주세요
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
