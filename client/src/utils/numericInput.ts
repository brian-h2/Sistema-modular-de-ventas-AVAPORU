import type { KeyboardEvent } from "react";

const NAVIGATION_KEYS = [
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Tab",
  "Home",
  "End",
  "Enter",
];

/** Bloquea en el keydown cualquier tecla que no sea un dígito (y opcionalmente un único punto decimal). */
export function blockNonNumericKey(
  e: KeyboardEvent<HTMLInputElement>,
  allowDecimal = false
) {
  if (e.ctrlKey || e.metaKey || e.altKey || NAVIGATION_KEYS.includes(e.key)) return;

  if (allowDecimal && e.key === "." && !e.currentTarget.value.includes(".")) return;

  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

/** Limpia un string dejando solo dígitos (y opcionalmente un único punto decimal), como respaldo ante pegado de texto. */
export function sanitizeNumericString(value: string, allowDecimal = false): string {
  if (!allowDecimal) {
    return value.replace(/[^0-9]/g, "");
  }
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}
