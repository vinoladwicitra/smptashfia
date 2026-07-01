export default function WelcomeSection() {
  return (
    <section className="bg-background">
      {/* Hero Banner - Full Width Desktop & Mobile */}
      <div className="w-full">
        <img src="/header-mobile.webp" alt="SMP Tashfia" className="w-full" />
      </div>

      {/* Desktop Welcome */}
      <div className="hidden lg:block py-16">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 className="text-[40px] leading-[50px] font-medium mb-4 text-text">
              Selamat Datang di <strong className="text-primary">Ma'had Putri Tashfia</strong>
            </h2>
            <p className="text-lg leading-relaxed text-text-light max-w-[800px] mx-auto">
              Ma'had Putri Tashfia adalah Sekolah Pesantran SMP Putri Bermanhaj Salaf yang Berlokasi di Kota Bekasi
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="aspect-video rounded-lg overflow-hidden shadow-md bg-black mb-4">
                <iframe
                  src="https://www.youtube.com/embed/Y51Zpt37BJ8"
                  title="Tashfia Boarding School"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-xl font-semibold text-primary">Tashfia Boarding School</h3>
            </div>
            <div className="text-center">
              <div className="aspect-video rounded-lg overflow-hidden shadow-md bg-black mb-4">
                <iframe
                  src="https://www.youtube.com/embed/OPfF_OUWke4"
                  title="Tashfia Full Day School"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-xl font-semibold text-primary">Tashfia Full Day School</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Welcome */}
      <div className="lg:hidden">
        {/* Welcome Text */}
        <div className="text-center py-6 px-5">
          <h2 className="text-xl font-bold text-text mb-2">
            Selamat Datang di<br/><strong className="text-primary">Ma'had Putri Tashfia</strong>
          </h2>
          <p className="text-xs text-text-light leading-relaxed">
            Sekolah Pesantran SMP Putri Bermanhaj Salaf di Kota Bekasi
          </p>
        </div>
        
        {/* Video 1: Boarding School */}
        <div className="py-6 bg-primary/5">
          <div className="max-w-7xl mx-auto px-5">
            <h3 className="text-base font-bold text-center text-text mb-4">Tashfia Boarding School</h3>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-black">
                <iframe
                  src="https://www.youtube.com/embed/Y51Zpt37BJ8"
                  title="Tashfia Boarding School"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Video 2: Full Day School */}
        <div className="py-6 bg-background">
          <div className="max-w-7xl mx-auto px-5">
            <h3 className="text-base font-bold text-center text-text mb-4">Tashfia Full Day School</h3>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-black">
                <iframe
                  src="https://www.youtube.com/embed/OPfF_OUWke4"
                  title="Tashfia Full Day School"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
