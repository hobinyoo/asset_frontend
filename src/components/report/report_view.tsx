'use client'

import { useState } from 'react'
import { useGetReports } from '@/queries/report'
import { useGenerateReportSSE } from '@/hooks/use_generate_report_sse'
import { ReportCard } from '@/components/report/report_card'
import { ReportDetail } from '@/components/report/report_detail'
import type { DailyReport } from '@/types/report'

export default function ReportView() {
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