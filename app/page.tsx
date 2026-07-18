import Hero from "@/components/home/Hero";
import ServicesBento from "@/components/home/ServicesBento";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import RepairProcess from "@/components/home/RepairProcess";
import LocationSection from "@/components/home/LocationSection";
import Link from 'next/link';
import { getLocalSettings, getFeaturedProducts } from "@/lib/db";
import { getImageUrl } from "@/lib/upload-image";

export default async function Home() {
  const settings = await getLocalSettings();
  const featuredData = await getFeaturedProducts(4);

  // Sign URLs for featured products
  const products = await Promise.all(featuredData.map(async (p) => {
    const signedImages = await Promise.all(
        p.images.map(img => getImageUrl(img))
    );
    return { ...p, images: signedImages };
  }));

  return (
    <>
      <Hero settings={settings} />
      <ServicesBento settings={settings} />
      <FeaturedProducts products={products} />
      <RepairProcess settings={settings} />
      <LocationSection />

      {/* Newsletter / CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="rounded-[3rem] bg-linear-to-br from-primary to-cyan-600 p-8 md:p-20 text-center text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

            <h2 className="text-4xl font-extrabold sm:text-6xl relative z-10">{settings.home.ctaTitle}</h2>
            <p className="mt-6 text-primary-foreground/80 max-w-xl mx-auto text-lg font-medium relative z-10">
              {settings.home.ctaSubtitle}
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-6 relative z-10">
              <Link href={settings.home.ctaButtonLink} className="h-16 px-10 rounded-2xl bg-white text-primary text-sm font-black transition-all hover:scale-105 active:scale-95 flex items-center shadow-xl">
                {settings.home.ctaButtonText}
              </Link>
              <Link href="/about" className="h-16 px-10 rounded-2xl bg-primary-foreground/10 text-white text-sm font-black border border-white/20 backdrop-blur-sm transition-all hover:bg-primary-foreground/20 flex items-center">
                درباره مجموعه ما
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
