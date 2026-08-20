import { useLayoutEffect, useRef, type PointerEvent } from "react";

/**
 * Material-style ripple on pointer down. Attach `ref` and `onPointerDown` to the
 * element; the element becomes a clipping container (`ripple-container` class).
 */
export function useRipple<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    ref.current?.classList.add("ripple-container");
  }, []);

  const onPointerDown = (event: PointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const rect = el.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height) * 2;
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.width = `${diameter}px`;
    span.style.height = `${diameter}px`;
    span.style.left = `${event.clientX - rect.left - diameter / 2}px`;
    span.style.top = `${event.clientY - rect.top - diameter / 2}px`;
    el.appendChild(span);
    window.setTimeout(() => span.remove(), 600);
  };

  return { ref, onPointerDown };
}