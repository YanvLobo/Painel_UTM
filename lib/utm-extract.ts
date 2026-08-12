type NoteAttribute = { name: string; value: string };

export type ExtractedUtm = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  landingPage: string | null;
  referrer: string | null;
  source: "cart_attr" | "landing_site_fallback";
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

/** Extrai UTM dos note_attributes (cart attributes gravados pelo snippet do tema). */
function fromNoteAttributes(noteAttributes: NoteAttribute[] | undefined) {
  const map = new Map((noteAttributes ?? []).map((a) => [a.name, a.value]));
  const hasAny = UTM_KEYS.some((k) => map.has(k));
  if (!hasAny) return null;

  return {
    utmSource: map.get("utm_source") ?? null,
    utmMedium: map.get("utm_medium") ?? null,
    utmCampaign: map.get("utm_campaign") ?? null,
    utmTerm: map.get("utm_term") ?? null,
    utmContent: map.get("utm_content") ?? null,
    landingPage: map.get("landing_page") ?? null,
    fromParam: map.get("from") ?? null,
  };
}

/** Fallback: extrai UTM da query string do landing_site que o Shopify já grava por padrão. */
function fromLandingSite(landingSite: string | null | undefined) {
  if (!landingSite) return null;
  try {
    const url = new URL(landingSite, "https://placeholder.invalid");
    const params = url.searchParams;
    const hasAny = UTM_KEYS.some((k) => params.has(k));
    if (!hasAny) return null;

    return {
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmTerm: params.get("utm_term"),
      utmContent: params.get("utm_content"),
      landingPage: landingSite,
      fromParam: params.get("from"),
    };
  } catch {
    return null;
  }
}

export function extractUtm(order: {
  note_attributes?: NoteAttribute[];
  landing_site?: string | null;
  referring_site?: string | null;
}): ExtractedUtm {
  const fromCart = fromNoteAttributes(order.note_attributes);
  if (fromCart) {
    const { fromParam, ...utm } = fromCart;
    return { ...utm, referrer: fromParam ?? order.referring_site ?? null, source: "cart_attr" };
  }

  const fromLanding = fromLandingSite(order.landing_site);
  if (fromLanding) {
    const { fromParam, ...utm } = fromLanding;
    return { ...utm, referrer: fromParam ?? order.referring_site ?? null, source: "landing_site_fallback" };
  }

  return {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    landingPage: order.landing_site ?? null,
    referrer: order.referring_site ?? null,
    source: "landing_site_fallback",
  };
}
