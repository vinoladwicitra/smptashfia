import { useState, useEffect, useRef, useCallback } from 'react';
import {
  IconChevronLeft, IconChevronRight, IconX, IconLoader2, IconAlertCircle,
  IconBuilding, IconFlask, IconDeviceDesktop, IconSchool, IconBook, IconUsers,
  IconSwimming, IconBallTennis
} from '@tabler/icons-react';

type Facility = {
  id: string;
  name: string;
  icon_name: string;
  images: string[];
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  IconBuilding,
  IconFlask,
  IconDeviceDesktop,
  IconSchool,
  IconBook,
  IconUsers,
  IconSwimming,
  IconBallTennis,
};

export default function FacilitiesCarousel() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

   useEffect(() => {
     const fetchFacilities = async () => {
       try {
         const res = await fetch('/api/facilities');
         if (!res.ok) throw new Error('Failed to fetch');
         const data = await res.json();
         if (data.success) {
           setFacilities(data.data);
           if (data.data.length > 0 && activeCategory >= data.data.length) {
             setActiveCategory(0);
             setActiveImage(0);
           }
         } else {
           setError(true);
         }
       } catch (err) {
         console.error('Error fetching facilities:', err);
         setError(true);
       } finally {
         setLoading(false);
       }
     };

     fetchFacilities();
   }, []);

   const currentFacility = facilities[activeCategory];

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpen) setLightboxOpen(false);
      if (!lightboxOpen || !currentFacility) return;
      if (e.key === 'ArrowLeft') {
        setActiveImage(prev => (prev - 1 + currentFacility.images.length) % currentFacility.images.length);
      } else if (e.key === 'ArrowRight') {
        setActiveImage(prev => (prev + 1) % currentFacility.images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentFacility]);

  // Reset activeImage when category changes
  useEffect(() => {
    setActiveImage(0);
  }, [activeCategory]);

  if (loading) {
    return (
      <section className="py-10 bg-background lg:py-16 lg:bg-white flex justify-center">
        <IconLoader2 size={32} className="animate-spin text-primary" />
      </section>
    );
  }

  if (error || facilities.length === 0) {
    return (
      <section className="py-10 bg-background lg:py-16 lg:bg-white">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <div className="flex flex-col items-center justify-center text-text-light">
            <IconAlertCircle size={48} className="mb-3" />
            <p>Fasilitas belum tersedia.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-background lg:py-16 lg:bg-white">
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-[40px] leading-[50px] font-medium mb-4 text-text">Fasilitas & Pelayanan</h2>
            <p className="text-text-light max-w-2xl mx-auto">Kami menyediakan berbagai fasilitas terbaik untuk mendukung proses pembelajaran dan kenyamanan siswa.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center gap-4 mb-10">
            {facilities.map((facility, index) => {
              const IconComponent = ICON_MAP[facility.icon_name] || ICON_MAP['IconBuilding'];
              return (
                <button
                  key={facility.id}
                  onClick={() => { setActiveCategory(index); setActiveImage(0); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                    activeCategory === index
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-white text-text border border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  <IconComponent size={20} />
                  {facility.name}
                </button>
              );
            })}
          </div>

          {/* Image Grid */}
          {currentFacility && currentFacility.images.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    alt={`${currentFacility.name} ${index + 1}`}
                    className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      index === 0 ? 'h-full min-h-[300px]' : 'aspect-square'
                    }`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {index === 0 && (
                    <div className="absolute bottom-4 left-4 bg-white/90 text-text px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                      {currentFacility.name}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-light">
              Belum ada gambar untuk kategori ini.
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="mb-5">
          <h2 className="text-[22px] font-bold text-text text-center">Fasilitas & Pelayanan</h2>
        </div>
        {facilities.length > 0 ? (
          <MobileFacilitiesView
            facilities={facilities}
            activeCategory={activeCategory}
            activeImage={activeImage}
            onCategoryChange={(i) => { setActiveCategory(i); setActiveImage(0); }}
            onImageChange={setActiveImage}
            onLightboxOpen={() => setLightboxOpen(true)}
          />
        ) : (
          <div className="text-center py-8 text-text-light">
            <IconAlertCircle size={40} className="mx-auto mb-2" />
            <p>Fasilitas belum tersedia.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentFacility && (
        <div className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxOpen(false)}>
            <IconX size={28} />
          </button>
          {currentFacility.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev - 1 + currentFacility.images.length) % currentFacility.images.length); }}
                className="absolute left-4 text-white cursor-pointer hover:opacity-80"
              >
                <IconChevronLeft size={40} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev + 1) % currentFacility.images.length); }}
                className="absolute right-4 text-white cursor-pointer hover:opacity=80"
              >
                <IconChevronRight size={40} />
              </button>
            </>
          )}
          <img
            src={currentFacility.images[activeImage]}
            alt={`${currentFacility.name} ${activeImage + 1}`}
            className="max-w-[95%] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

// Simple mobile component defined inline (could be extracted)
function MobileFacilitiesView({
  facilities,
  activeCategory,
  activeImage,
  onCategoryChange,
  onImageChange,
  onLightboxOpen,
}: {
  facilities: Facility[];
  activeCategory: number;
  activeImage: number;
  onCategoryChange: (i: number) => void;
  onImageChange: (i: number) => void;
  onLightboxOpen: () => void;
}) {
  const current = facilities[activeCategory];
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
        {facilities.map((f, i) => {
          // IconComponent resolution
          const IconComp = (ICON_MAP[f.icon_name] || ICON_MAP['IconBuilding']);
          return (
            <button
              key={f.id}
              onClick={() => onCategoryChange(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                i === activeCategory ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-text-light'
              }`}
            >
              <IconComp size={16} />
              {f.name}
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
          <img src={current.images[activeImage]} alt={`${current.name} ${activeImage + 1}`} className="w-full h-full object-cover" loading="lazy" />
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
