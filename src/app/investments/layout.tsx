import InvestmentTabBar from '@/components/investment/investment_tab_bar'

export default function InvestmentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      <InvestmentTabBar />
      {children}
    </div>
  )
}
