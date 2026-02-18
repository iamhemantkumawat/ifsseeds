const BACKEND_ROOT = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");

export const SITE_ASSETS = {
  logo: "/uploads/site/ifs-logo.png",
  heroMain: "/uploads/site/manish-stall10.jpg",
  teamManish: "/uploads/site/team-manish.jpeg",
  teamSundaram: "/uploads/site/team-sundaram.jpeg",
  razorpayLogo: "/uploads/site/razorpay-logo.svg",
};

export function toAssetUrl(source) {
  if (!source) return "";
  if (/^(https?:)?\/\//i.test(source) || source.startsWith("data:") || source.startsWith("blob:")) {
    return source;
  }

  if (!BACKEND_ROOT) {
    return source;
  }

  const normalized = source.startsWith("/") ? source : `/${source}`;
  return `${BACKEND_ROOT}${normalized}`;
}
