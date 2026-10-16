// Entity records (leads, deals, ...) are created from form-builder templates whose
// fields can be named anything - a company's custom template may have no field
// literally called "name" (e.g. a "First Name"/"Last Name" pair, or "Full Name").
// This resolves a sensible display name from whatever fields actually exist,
// instead of assuming the default template's "name" field is always present.
export function getEntityDisplayName(data: Record<string, any> | null | undefined, fallback: string): string {
  if (!data) return fallback;

  const byNormalizedKey = new Map<string, string>();
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && value.trim()) {
      byNormalizedKey.set(key.toLowerCase().replace(/[^a-z0-9]/g, ""), value.trim());
    }
  }

  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = byNormalizedKey.get(key);
      if (value) return value;
    }
    return null;
  };

  const direct = pick("name", "fullname", "dealname", "leadname", "title", "customername", "companyname");
  if (direct) return direct;

  const firstLast = [pick("firstname"), pick("lastname")].filter(Boolean).join(" ");
  if (firstLast) return firstLast;

  return pick("email") || fallback;
}
