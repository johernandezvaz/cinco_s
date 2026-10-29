import path from "node:path";
import { Font } from "@react-pdf/renderer";
import { FONT_DIR, fonts } from "../theme";

let registered = false;

/** Registra Inter y Barlow Condensed desde los .ttf estáticos del repo (sin red). */
export function registerFonts() {
  if (registered) return;
  for (const { family, files } of Object.values(fonts)) Font.register({ family, fonts: files.map(({ file, weight }) => ({ src: path.join(FONT_DIR, file), fontWeight: weight })) });
  // Sin guiones automáticos: nombres de estación y preguntas se cortan por palabra.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
