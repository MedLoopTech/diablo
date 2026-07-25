import { getRequestConfig } from "next-intl/server";

// v1 ships English only, but every user-facing string goes through t()
// so Urdu can be added by dropping in messages/ur.json later.
export const locales = ["en"] as const;
export const defaultLocale = "en";

export default getRequestConfig(async () => {
  const locale = defaultLocale;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: "Asia/Karachi",
  };
});
