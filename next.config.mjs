// The container runs .next/standalone/server.js: only the files the site needs, no dev dependencies.
// og/: the fonts the link-preview cards are drawn with (lib/og.tsx reads them at run time, so they are copied in).
export default { output: "standalone", outputFileTracingIncludes: { "/og/[key]": ["./og/*.woff"] } };
