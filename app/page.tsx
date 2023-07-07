import { ScrapeFrom } from '@/components/scrape-form'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-screen-xl items-center font-mono text-sm lg:flex">
        <ScrapeFrom />
      </div>
    </main>
  )
}
