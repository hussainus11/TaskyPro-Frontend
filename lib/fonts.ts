/**
 * Production-safe font variables.
 *
 * This project previously used `next/font/google`, but in some environments
 * (offline builds / restricted networking / Turbopack font loader issues) it can
 * cause production builds to fail. We keep the public contract (`fontVariables`)
 * so `app/layout.tsx` continues to work, while relying on system fonts.
 */
export const fontVariables = [
  "[--font-inter:ui-sans-serif]",
  "[--font-geist:ui-sans-serif]",
  "[--font-roboto:ui-sans-serif]",
  "[--font-montserrat:ui-sans-serif]",
  "[--font-poppins:ui-sans-serif]",
  "[--font-plus-jakarta-sans:ui-sans-serif]",
  "[--font-pt-sans:ui-sans-serif]",
  "[--font-hedvig-letters-serif:ui-serif]",
  "[--font-kumbh-sans:ui-sans-serif]",
  "[--font-overpass-mono:ui-monospace]"
].join(" ");
