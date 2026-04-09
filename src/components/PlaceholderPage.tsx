import Header from './Header'
import MobileHeader from './MobileHeader'
import Footer from './Footer'
import StickyMobileBottomBar from './StickyMobileBottomBar'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <Header />
      <MobileHeader />
      <main>
        <section className="py-16 min-h-[60vh] flex items-center justify-center">
          <div className="max-w-5xl mx-auto px-8 text-center">
            <h1 className="text-3xl font-bold text-text mb-4">{title}</h1>
            <p className="text-text-light">Halaman ini sedang dalam pengembangan.</p>
          </div>
        </section>
      </main>
      <Footer />
      <StickyMobileBottomBar />
    </>
  )
}

export default PlaceholderPage
