import { HeroSection } from "@/components/HeroSection";
import { ManifestoSection } from "@/components/ManifestoSection";
import { GallerySection } from "@/components/GallerySection";
import { Footer } from "@/components/Footer";

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <ManifestoSection />
      <GallerySection />
      <Footer />
    </div>
  );
}
