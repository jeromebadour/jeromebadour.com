import type { BrandName, GlyphName } from "@/components/Glyph";

// A tool in a "Built with" row: with its brand mark when it has one, or a glyph.
export type Tech = { name: string; brand?: BrandName; g?: GlyphName };
export const B = (name: string, brand: BrandName): Tech => ({ name, brand });
export const G = (name: string, g: GlyphName): Tech => ({ name, g });
