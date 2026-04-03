import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, MessageCircle, Sprout } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CartSidebar from "@/components/landing/CartSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/App";
import { PRODUCT_GUIDES } from "@/data/productGuides";

export default function ProductGuidesPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4fbf5_0%,#fcfaf5_36%,#ffffff_100%)] text-stone-900">
      <Navbar cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="pb-20 pt-24">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_30px_80px_-45px_rgba(22,101,52,0.45)]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-[radial-gradient(circle_at_top_left,_rgba(163,230,53,0.30),_transparent_40%),linear-gradient(180deg,#0f6b3d_0%,#0c4a2d_100%)] p-8 sm:p-10">
                <Badge className="rounded-full bg-white/15 px-4 py-1 text-white backdrop-blur">
                  <BookOpen className="mr-2 h-3.5 w-3.5" />
                  Farmer Guides
                </Badge>
                <h1
                  className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Package of Practices for IFS Seeds varieties
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/90 sm:text-lg">
                  Share these guide pages with farmers using direct links or QR codes.
                  Each page opens in Hindi by default and includes the English version too.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/shop">
                    <Button className="rounded-full bg-white text-emerald-900 hover:bg-emerald-50">
                      Browse Products
                    </Button>
                  </Link>
                  <a
                    href="https://wa.me/919950279664?text=Hello, I want more information about IFS Seeds guides."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp Support
                    </Button>
                  </a>
                </div>
              </div>

              <div className="bg-stone-50 p-8 sm:p-10">
                <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Available Guides
                  </p>
                  <div className="mt-5 space-y-4">
                    {PRODUCT_GUIDES.map((guide) => (
                      <Link
                        key={guide.slug}
                        to={`/guides/${guide.slug}`}
                        className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                          <Sprout className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            {guide.crop}
                          </p>
                          <h2
                            className="mt-1 text-lg font-semibold text-stone-900"
                            style={{ fontFamily: "Outfit, sans-serif" }}
                          >
                            {guide.variety}
                          </h2>
                          <p className="mt-1 text-sm text-stone-600">
                            {guide.titleHindi}
                          </p>
                        </div>
                        <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-stone-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PRODUCT_GUIDES.map((guide) => (
              <article
                key={guide.slug}
                className="overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-[0_25px_60px_-45px_rgba(15,107,61,0.5)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={guide.image}
                    alt={`${guide.variety} guide pack`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {guide.crop}
                  </p>
                  <h2
                    className="mt-3 text-2xl font-semibold text-stone-900"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {guide.variety}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {guide.titleHindi}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {guide.stats.slice(0, 3).map((stat) => (
                      <Badge
                        key={`${guide.slug}-${stat.label}`}
                        variant="secondary"
                        className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
                      >
                        {stat.value}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={`/guides/${guide.slug}`}>
                      <Button className="rounded-full bg-emerald-700 hover:bg-emerald-800">
                        Open Guide
                      </Button>
                    </Link>
                    <Link to={`/shop?search=${encodeURIComponent(guide.shopSearch)}`}>
                      <Button variant="outline" className="rounded-full">
                        View Product
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
