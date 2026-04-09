import { IconPhone, IconBrandWhatsapp, IconMail, IconMapPin, IconClock, IconArrowRight, IconExternalLink } from '@tabler/icons-react';

const contactInfo = [
  {
    icon: IconPhone,
    title: 'Telepon',
    value: '(021) 84978071',
    href: 'tel:+622184978071',
    label: 'Hubungi Sekarang',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: IconBrandWhatsapp,
    title: 'WhatsApp',
    value: '08111-881-097',
    href: 'https://wa.me/628111881097',
    label: 'Chat via WhatsApp',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: IconMail,
    title: 'Email',
    value: 'humas@smptashfia.sch.id',
    href: 'mailto:humas@smptashfia.sch.id',
    label: 'Kirim Email',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: IconMapPin,
    title: 'Alamat',
    value: 'Jl. Dr. Ratna No.82, RT.02/RW.08, Kel. Jatikramat, Kec. Jatiasih, Kota Bekasi, Jawa Barat 17421',
    href: 'https://maps.app.goo.gl/ju7qW5xSXENTzcU89',
    label: 'Lihat di Google Maps',
    color: 'bg-orange-100 text-orange-600',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">Kami siap membantu Anda. Silakan hubungi kami melalui salah satu saluran berikut.</p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-start gap-5 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${item.color} flex items-center justify-center`}>
                    <Icon size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-text mb-1">{item.title}</h3>
                    <p className="text-text-light text-sm leading-relaxed mb-3">{item.value}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      {item.label}
                      <IconArrowRight size={16} />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text">Lokasi Kami</h2>
              <p className="text-text-light mt-1">Kunjungi langsung sekolah kami</p>
            </div>
            <a
              href="https://maps.app.goo.gl/ju7qW5xSXENTzcU89"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Buka Google Maps <IconExternalLink size={16} />
            </a>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md bg-black">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15863.614022201797!2d106.9516837!3d-6.2764164!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698d730bca8f7f%3A0xa7c63c7cbe29afe3!2sSMP%20Tashfia!5e0!3m2!1sid!2sid!4v1775721806664!5m2!1sid!2sid"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi SMP Tashfia"
              className="w-full"
            ></iframe>
          </div>
          <div className="md:hidden mt-4">
            <a
              href="https://maps.app.goo.gl/ju7qW5xSXENTzcU89"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Buka Google Maps <IconExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-5xl mx-auto px-8">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <IconClock size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Jam Operasional</h2>
            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center text-text-light">
                <span className="font-medium text-text">Senin - Jumat</span>
                <span>07.30 - 15.10 WIB</span>
              </div>
              <div className="flex justify-between items-center text-text-light">
                <span className="font-medium text-text">Sabtu</span>
                <span>Tutup</span>
              </div>
              <div className="flex justify-between items-center text-text-light">
                <span className="font-medium text-text">Minggu</span>
                <span>Tutup</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
