"use client";

import { useEffect } from "react";

/**
 * Universal Body Scroll Lock System
 * Prevents the background page from scrolling when modals or dialogs are open,
 * while preserving smooth scrolling inside modal containers and preventing layout shift.
 */

let lockCount = 0;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";
let originalBodyPaddingRight = "";
const activeModalElements = new Set<Element>();
let isObserverInitialized = false;

export function lockBodyScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (lockCount === 0) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");

    // Prevent layout shift when scrollbar disappears
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
  }
  lockCount++;
}

export function unlockBodyScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.style.overflow = originalHtmlOverflow || "";
    document.body.style.overflow = originalBodyOverflow || "";
    document.body.style.paddingRight = originalBodyPaddingRight || "";
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }
}

/**
 * React hook to lock body scrolling whenever `isLocked` is true.
 * Cleans up automatically on component unmount or when `isLocked` becomes false.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}

/**
 * Checks if a DOM element is a visible modal backdrop / overlay
 */
function isModalBackdropElement(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.getAttribute("data-modal") === "true") return true;

  const classList = el.className || "";
  if (typeof classList !== "string") return false;

  const isFixed = classList.includes("fixed") && classList.includes("inset-0");
  if (!isFixed) return false;

  // Exclude transparent dropdown backdrops (e.g. click-outside closers)
  if (classList.includes("bg-transparent") && !classList.includes("backdrop-blur")) {
    return false;
  }

  // Check for modal indicators: darkened backdrop or blur or high z-index
  const hasDarkBackdrop = classList.includes("bg-black") || classList.includes("bg-gray-900/60") || classList.includes("bg-slate-900");
  const hasBackdropBlur = classList.includes("backdrop-blur");
  const hasHighZ = classList.includes("z-50") || classList.includes("z-[50]") || classList.includes("z-[60]") || classList.includes("z-[70]") || classList.includes("z-[80]") || classList.includes("z-[90]") || classList.includes("z-[100]") || classList.includes("z-[9999]");

  return (hasDarkBackdrop || hasBackdropBlur) && hasHighZ;
}

/**
 * Initializes a global DOM observer and backdrop wheel handler so that ANY modal
 * appearing anywhere in the app automatically freezes the background.
 */
export function initGlobalModalScrollLock() {
  if (typeof window === "undefined" || typeof document === "undefined" || isObserverInitialized) return;
  isObserverInitialized = true;

  // Scan existing elements
  const existingBackdrops = document.querySelectorAll(".fixed.inset-0, [data-modal='true']");
  existingBackdrops.forEach((el) => {
    if (isModalBackdropElement(el) && !activeModalElements.has(el)) {
      activeModalElements.add(el);
      lockBodyScroll();
    }
  });

  // Observe DOM for added or removed modals
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (isModalBackdropElement(node) && !activeModalElements.has(node)) {
            activeModalElements.add(node);
            lockBodyScroll();
          }
          const nested = node.querySelectorAll?.(".fixed.inset-0, [data-modal='true']");
          nested?.forEach((el) => {
            if (isModalBackdropElement(el) && !activeModalElements.has(el)) {
              activeModalElements.add(el);
              lockBodyScroll();
            }
          });
        }
      });

      m.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (activeModalElements.has(node)) {
            activeModalElements.delete(node);
            unlockBodyScroll();
          }
          activeModalElements.forEach((el) => {
            if (!document.body.contains(el)) {
              activeModalElements.delete(el);
              unlockBodyScroll();
            }
          });
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Passive wheel/touch handler: when cursor is directly over modal backdrop, stop wheel event propagation to window
  window.addEventListener(
    "wheel",
    (e) => {
      if (lockCount > 0) {
        const target = e.target as HTMLElement | null;
        if (target && isModalBackdropElement(target)) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (lockCount > 0) {
        const target = e.target as HTMLElement | null;
        if (target && isModalBackdropElement(target)) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );
}
