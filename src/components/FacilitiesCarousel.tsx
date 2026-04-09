import { useState, useRef, useCallback } from 'react';
import { IconChevronLeft, IconChevronRight, IconX, IconBuilding, IconFlask, IconArrowRight } from '@tabler/icons-react';

const facilities = [
  {
    category: 'Asrama',
    icon: IconBuilding,
    images: [
      '/assets/asrama-1.webp',
      '/assets/asrama-2.webp',
      '/assets/asrama-3.webp',
      '/assets/asrama-4.webp',
      '/assets/asrama-5.webp',
    ],
  },
  {
    category: 'Lab IPA',
    icon: IconFlask,
    images: [
      '/assets/lab-ipa-1.webp',
      '/assets/lab-ipa-2.webp',
      '/assets/lab-ipa-3.webp',
      '/assets/lab-ipa-4.webp',
      '/assets/lab-ipa-5.webp',
    ],
  },
];

type Facility = typeof facilities[0];

function MobileFacilities({ activeCategory, activeImage, data, onCategoryChange, onImageChange, onLightboxOpen }: {
  activeCategory: number;
  activeImage: number;
  data: Facility[];
  onCategoryChange: (i: number) => void;
  onImageChange: (i: number) => void;
  onLightboxOpen: () => void;
}) {
  const current = data[activeCategory];
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
    const diff = Math.abs(touchStartX.current - touchEndX.current);
    if (diff > 10) e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) onImageChange((activeImage + 1) % current.images.length);
      else onImageChange((activeImage - 1 + current.images.length) % current.images.length);
    }
  }, [activeImage, current.images.length, onImageChange]);

  return (
    <div className="px-5">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {data.map((f, i) => {
          const Icon = f.icon;
          return (
            <button
              key={f.category}
              onClick={() => onCategoryChange(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                i === activeCategory ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-text-light'
              }`}
            >
              <Icon size={16} />
              {f.category}
            </button>
          );
        })}
      </div>

      <div className="relative mb-3">
        <div
          className="rounded-xl overflow-hidden shadow-sm bg-black aspect-[4/3]"
          onClick={onLightboxOpen}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img src={current.images[activeImage]} alt={`${current.category} ${activeImage + 1}`} className="w-full h-full object-cover" loading="lazy" />
        </div>
        {current.images.length > 1 && (
          <>
            <button onClick={() => onImageChange((activeImage - 1 + current.images.length) % current.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full">
              <IconChevronLeft size={20} />
            </button>
            <button onClick={() => onImageChange((activeImage + 1) % current.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full">
              <IconChevronRight size={20} />
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
          {activeImage + 1}/{current.images.length}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {current.images.map((img: string, i: number) => (
          <button key={i} onClick={() => onImageChange(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${i === activeImage ? 'border-primary shadow-sm' : 'border-transparent opacity-60'}`}>
            <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FacilitiesCarousel() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentFacility = facilities[activeCategory];

  return (
    <section className="py-10 bg-background lg:py-16 lg:bg-white">
      {/* Desktop - Redesigned */}
      <div className="hidden lg:block">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-[40px] leading-[50px] font-medium mb-4 text-text">Fasilitas & Pelayanan</h2>
            <p className="text-text-light max-w-2xl mx-auto">Kami menyediakan berbagai fasilitas terbaik untuk mendukung proses pembelajaran dan kenyamanan siswa.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center gap-4 mb-10">
            {facilities.map((facility, index) => {
              const Icon = facility.icon;
              return (
                <button
                  key={facility.category}
                  onClick={() => { setActiveCategory(index); setActiveImage(0); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                    activeCategory === index
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-white text-text border border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  <Icon size={20} />
                  {facility.category}
                </button>
              );
            })}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {currentFacility.images.map((image, index) => (
              <div
                key={index}
                className={`relative rounded-xl overflow-hidden shadow-md group cursor-pointer ${
                  index === 0 ? 'col-span-2 row-span-2' : ''
                }`}
                onClick={() => { setActiveImage(index); setLightboxOpen(true); }}
              >
                <img
                  src={image}
                  alt={`${currentFacility.category} ${index + 1}`}
                  className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    index === 0 ? 'h-full min-h-[300px]' : 'aspect-square'
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {index === 0 && (
                  <div className="absolute bottom-4 left-4 bg-white/90 text-text px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                    {currentFacility.category}
                    <IconArrowRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {currentFacility.images.length > 1 && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setActiveImage((prev) => (prev - 1 + currentFacility.images.length) % currentFacility.images.length)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border rounded-xl hover:border-primary hover:text-primary transition-colors text-sm font-medium cursor-pointer"
              >
                <IconChevronLeft size={18} /> Sebelumnya
              </button>
              <button
                onClick={() => setActiveImage((prev) => (prev + 1) % currentFacility.images.length)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border rounded-xl hover:border-primary hover:text-primary transition-colors text-sm font-medium cursor-pointer"
              >
                Selanjutnya <IconChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="mb-5">
          <h2 className="text-[22px] font-bold text-text text-center">Fasilitas & Pelayanan</h2>
        </div>
        <MobileFacilities
          activeCategory={activeCategory}
          activeImage={activeImage}
          data={facilities}
          onCategoryChange={(i) => { setActiveCategory(i); setActiveImage(0); }}
          onImageChange={setActiveImage}
          onLightboxOpen={() => setLightboxOpen(true)}
        />
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxOpen(false)}>
            <IconX size={28} />
          </button>
          {currentFacility.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev - 1 + currentFacility.images.length) % currentFacility.images.length); }} className="absolute left-4 text-white">
                <IconChevronLeft size={40} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev + 1) % currentFacility.images.length); }} className="absolute right-4 text-white">
                <IconChevronRight size={40} />
              </button>
            </>
          )}
          <img
            src={currentFacility.images[activeImage]}
            alt={`${currentFacility.category} ${activeImage + 1}`}
            className="max-w-[95%] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
