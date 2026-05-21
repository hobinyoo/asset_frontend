'use client'

import type { DailyReport } from '@/types/report'

export function ReportDetail({ report }: { report: DailyReport }) {
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