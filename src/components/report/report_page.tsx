'use client'

import { useState } from 'react'
import { useGenerateReport, useGetReports } from '@/queries/report'
import { DailyReport } from '@/types/report'

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

      {/* 요약 (카톡용) */}
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
  const generateReport = useGenerateReport()
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)

  const reportList: DailyReport[] = reports ?? []

  const handleGenerate = () => {
    generateReport.mutate(undefined, {
      onSuccess: (newReport) => {
        setSelectedReport(newReport)
      },
    })
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
          disabled={generateReport.isPending}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {generateReport.isPending ? '생성 중...' : '🤖 오늘 리포트 생성'}
        </button>
      </div>

      {generateReport.isPending && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 p-4 text-sm text-blue-600">
          <span className="animate-spin">⟳</span>
          AI가 종목을 분석하고 있습니다... (약 10~20초 소요)
        </div>
      )}

      {reportList.length === 0 && !generateReport.isPending ? (
        <div className="flex h-60 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 text-gray-400">
          <span className="text-4xl">📭</span>
          <p className="text-sm">아직 리포트가 없습니다</p>
          <button
            onClick={handleGenerate}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            첫 리포트 생성하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* 리포트 목록 */}
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

          {/* 리포트 상세 */}
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
