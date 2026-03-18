import TabBar from '@/components/common/tab_bar'

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      <TabBar />
      {children}
    </div>
  )
}
