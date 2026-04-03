import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Copy,
  ExternalLink,
  Languages,
  MessageCircle,
  ScanLine,
  Share2,
  Sprout,
  ThermometerSun,
  Wheat,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CartSidebar from "@/components/landing/CartSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useCart } from "@/App";
import { getProductGuideBySlug } from "@/data/productGuides";

function GuideSection({ section, orderedClassName = "" }) {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm shadow-emerald-950/5">
      <h3
        className="text-xl font-semibold text-stone-900"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {section.title}
      </h3>

      {section.type === "facts" ? (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {section.items.map((item) => (
            <div
              key={`${section.title}-${item.label}`}
              className="rounded-2xl bg-stone-50 px-4 py-3"
            >
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-stone-900">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : section.type === "ordered" ? (
        <ol className={`mt-5 space-y-3 ${orderedClassName}`}>
          {section.items.map((item, index) => (
            <li
              key={`${section.title}-${index}`}
              className="flex gap-3 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-700"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mt-5 space-y-3">
          {section.items.map((item, index) => (
            <li
              key={`${section.title}-${index}`}
              className="flex gap-3 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-700"
            >
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ProductGuidePage() {
  const { slug } = useParams();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart();
  const guide = getProductGuideBySlug(slug);

  if (!guide) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />
        <main className="px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Product Guide
            </p>
            <h1
              className="mt-4 text-3xl font-semibold text-stone-900"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Guide not found
            </h1>
            <p className="mt-4 text-stone-600">
              This product information page is not available yet.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/shop">
                <Button className="rounded-full bg-emerald-700 hover:bg-emerald-800">
                  Browse Products
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="rounded-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : `/guides/${guide.slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareUrl)}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`IFS Seeds ${guide.variety} guide: ${shareUrl}`)}`;
  const quickFactToneClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    lime: "bg-lime-50 text-lime-700",
  };
  const quickFactIcons = {
    climate: ThermometerSun,
    calendar: CalendarDays,
    crop: Wheat,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Guide link copied");
    } catch (error) {
      toast.error("Could not copy the link");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      window.open(whatsappShareUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      await navigator.share({
        title: guide.title,
        text: `IFS Seeds ${guide.variety} guide`,
        url: shareUrl,
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast.error("Sharing is not available right now");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4fbf5_0%,#fcfaf5_36%,#ffffff_100%)] text-stone-900">
      <Navbar cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="pb-20 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/shop"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>

          <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_30px_80px_-45px_rgba(22,101,52,0.45)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(163,230,53,0.30),_transparent_40%),linear-gradient(180deg,#0f6b3d_0%,#0c4a2d_100%)] p-6 sm:p-8 lg:p-10">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%)]" />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full bg-white/15 px-4 py-1 text-white backdrop-blur">
                      <Sprout className="mr-2 h-3.5 w-3.5" />
                      Product Guide
                    </Badge>
                    <Badge className="rounded-full bg-lime-300 px-4 py-1 text-emerald-950">
                      First Choice of Farmers
                    </Badge>
                  </div>

                  <div className="mt-6 max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-lime-200">
                      {guide.crop}
                    </p>
                    <h1
                      className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {guide.title}
                    </h1>
                    <p className="mt-4 text-base leading-7 text-emerald-50/90 sm:text-lg">
                      {guide.titleHindi}
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {guide.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm"
                      >
                        <p className="text-xs uppercase tracking-[0.22em] text-lime-200">
                          {stat.label}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                    <img
                      src={guide.image}
                      alt={`${guide.variety} product pack`}
                      className="h-full w-full rounded-[1.25rem] object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="relative p-6 sm:p-8 lg:p-10">
                <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-100/60 blur-3xl" />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="rounded-full border-emerald-200 px-4 py-1 text-emerald-700">
                      <BookOpen className="mr-2 h-3.5 w-3.5" />
                      Shareable field guide
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-amber-200 px-4 py-1 text-amber-700">
                      <Languages className="mr-2 h-3.5 w-3.5" />
                      English + Hindi
                    </Badge>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {guide.quickFacts.map((fact) => {
                      const Icon = quickFactIcons[fact.icon] || Wheat;
                      const toneClasses = quickFactToneClasses[fact.tone] || "bg-stone-50 text-stone-700";

                      return (
                        <div key={`${guide.slug}-${fact.label}`} className={`rounded-2xl p-4 ${toneClasses}`}>
                          <Icon className="h-5 w-5" />
                          <p className="mt-3 text-xs uppercase tracking-[0.2em]">
                            {fact.label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-stone-800">
                            {fact.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                          QR and Link
                        </p>
                        <h2
                          className="mt-2 text-2xl font-semibold text-stone-900"
                          style={{ fontFamily: "Outfit, sans-serif" }}
                        >
                          Share this guide with farmers
                        </h2>
                        <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
                          Scan the QR code or send the direct link on WhatsApp. This page is designed to work cleanly on mobile phones in the field.
                        </p>
                      </div>
                      <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm">
                        <img
                          src={qrCodeUrl}
                          alt={`${guide.variety} QR code`}
                          className="h-40 w-40 rounded-2xl"
                        />
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-3 text-sm text-stone-700">
                      {shareUrl}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        onClick={handleCopyLink}
                        className="rounded-full bg-emerald-700 hover:bg-emerald-800"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button
                        onClick={handleNativeShare}
                        variant="outline"
                        className="rounded-full border-stone-300"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                      <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="rounded-full border-stone-300">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Link to={`/shop?search=${encodeURIComponent(guide.shopSearch)}`}>
                      <Button className="w-full rounded-full bg-stone-900 hover:bg-stone-800">
                        Buy {guide.variety} Seeds
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <a
                      href={`https://wa.me/919950279664?text=${encodeURIComponent(guide.supportMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                        Talk to IFS Seeds
                        <MessageCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 rounded-[2rem] border border-emerald-100 bg-white p-4 shadow-sm shadow-emerald-950/5 sm:p-6">
            <Tabs defaultValue="hindi">
              <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Package of Practices
                  </p>
                  <h2
                    className="mt-2 text-3xl font-semibold text-stone-900"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Complete cultivation guidance
                  </h2>
                </div>
                <TabsList className="h-auto rounded-full bg-stone-100 p-1">
                  <TabsTrigger value="hindi" className="rounded-full px-5 py-2.5">
                    हिंदी
                  </TabsTrigger>
                  <TabsTrigger value="english" className="rounded-full px-5 py-2.5">
                    English
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="english" className="mt-6">
                <div className="grid gap-5 lg:grid-cols-2">
                  {guide.englishSections.map((section) => (
                    <GuideSection key={section.title} section={section} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hindi" className="mt-6">
                <div className="grid gap-5 lg:grid-cols-2">
                  {guide.hindiSections.map((section) => (
                    <GuideSection key={section.title} section={section} orderedClassName="font-medium" />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <section className="mt-10 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <ScanLine className="mt-1 h-6 w-6 shrink-0 text-amber-700" />
              <div>
                <h3
                  className="text-xl font-semibold text-stone-900"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Disclaimer
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-700">
                  {guide.disclaimer.en}
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-700">
                  {guide.disclaimer.hi}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
