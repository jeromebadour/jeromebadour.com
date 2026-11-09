/** A proposal page's address from the job's title: lowercase words joined by dashes, 50 characters at most. */
export function slugify(title: string): string {
  return title.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-")
    .replace(/^-|-$/g, "").slice(0, 50).replace(/-$/, "") || "job";
}
