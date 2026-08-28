import Navbar from '../components/navbar'
import SiteFooter from '../components/site-footer'

export default function SociosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="bg-white pt-16 md:pt-[72px]">
        {children}
        <SiteFooter />
      </main>
    </>
  )
}
