(() => {
  const STYLE_VARIANT_PARAM = "design";
  const STYLE_VARIANT_KEY = "precision-omics-style-variant";
  const VARIANT_ALIASES = {
    "variant-a": "variant-a",
    a: "variant-a",
    "variant-b": "variant-b",
    b: "variant-b",
    "variant-c": "variant-c",
    c: "variant-c",
    default: "default",
  };
  const VALID_VARIANTS = new Set(Object.values(VARIANT_ALIASES));

  const safeLocalStorage = {
    getItem(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (_) {
        return null;
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (_) {
        /* no-op */
      }
    },
  };

  const normalizeVariant = (value) => {
    if (!value) return null;
    const normalized = String(value).toLowerCase();
    const alias = VARIANT_ALIASES[normalized] || normalized;
    return VALID_VARIANTS.has(alias) ? alias : null;
  };

  const readVariantFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return normalizeVariant(params.get(STYLE_VARIANT_PARAM));
  };

  const readVariantFromStorage = () => normalizeVariant(safeLocalStorage.getItem(STYLE_VARIANT_KEY));

  const writeVariantToStorage = (variant) => safeLocalStorage.setItem(STYLE_VARIANT_KEY, variant);

  const applyVariantMetadata = (variant) => {
    const resolved = variant || "default";
    if (document?.documentElement) {
      document.documentElement.setAttribute("data-style-variant", resolved);
    }
    window.__PO_STYLE_VARIANT__ = resolved;
  };

  const ensureVariantStylesheet = (variant) => {
    const existing = document.querySelector("link[data-style-variant]");
    if (existing) {
      existing.remove();
    }

    if (!variant || variant === "default") {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    const suffix = variant === "variant-b" ? "b" : variant === "variant-c" ? "c" : variant === "variant-a" ? "a" : variant;
    link.href = `assets/styles-variant-${suffix}.css`;
    link.setAttribute("data-style-variant", variant);
    document.head.appendChild(link);
  };

  let variant = readVariantFromUrl();

  if (variant) {
    writeVariantToStorage(variant);
  }

  if (!variant) {
    variant = readVariantFromStorage();
  }

  if (!variant) {
    variant = "default";
  }

  applyVariantMetadata(variant);
  ensureVariantStylesheet(variant);
})();
