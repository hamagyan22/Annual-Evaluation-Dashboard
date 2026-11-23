"use client";

import React, { useEffect } from "react";
import { getSystemAuthor, getSystemSignatureText, verifySystemIntegrity } from "@/lib/firebaseClient";

const SIGNATURE_DOM_ID = "sys-architect-watermark-root";

export default function SystemSignatureGuard() {
  const author = getSystemAuthor();
  const fullText = getSystemSignatureText();

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const enforceWatermark = () => {
      // 1. Ensure meta tags exist in <head>
      const ensureMeta = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = name;
          document.head.appendChild(meta);
        }
        if (meta.content !== content) {
          meta.content = content;
        }
      };
      ensureMeta("author", author);
      ensureMeta("creator", fullText);
      ensureMeta("copyright", `© ${new Date().getFullYear()} ${author}`);

      // 2. Ensure visible footer signature element exists and is not hidden or tampered with
      let el = document.getElementById(SIGNATURE_DOM_ID);
      if (!el) {
        el = document.createElement("footer");
        el.id = SIGNATURE_DOM_ID;
        document.body.appendChild(el);
      }

      const expectedLabel = `${fullText} • © ${new Date().getFullYear()}`;
      if (!verifySystemIntegrity(el.textContent || "") || !el.textContent?.includes(author)) {
        el.innerHTML = `
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:9999px;background:rgba(28,107,83,0.06);border:1px solid rgba(28,107,83,0.15);font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.2px;">
            <span style="width:6px;height:6px;border-radius:9999px;background:#10b981;display:inline-block;"></span>
            <span>Designed by <strong style="color:#1C6B53;font-weight:900;">${author}</strong> • © ${new Date().getFullYear()}</span>
          </div>
        `;
      }

      // Prevent CSS hiding tampering & raise positioning nicely
      el.style.setProperty("display", "flex", "important");
      el.style.setProperty("justify-content", "center", "important");
      el.style.setProperty("align-items", "center", "important");
      el.style.setProperty("width", "100%", "important");
      el.style.setProperty("padding", "0px 16px 20px 16px", "important");
      el.style.setProperty("margin-top", "-22px", "important");
      el.style.setProperty("visibility", "visible", "important");
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("pointer-events", "auto", "important");
      el.style.setProperty("position", "relative", "important");
      el.style.setProperty("z-index", "10", "important");
      el.setAttribute("data-architect", author);
      el.setAttribute("aria-label", expectedLabel);
    };

    enforceWatermark();

    const observer = new MutationObserver(() => {
      const el = document.getElementById(SIGNATURE_DOM_ID);
      if (
        !el ||
        !el.textContent?.includes(author) ||
        el.style.display === "none" ||
        el.style.visibility === "hidden" ||
        el.style.opacity === "0"
      ) {
        enforceWatermark();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    const interval = setInterval(enforceWatermark, 4000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [author, fullText]);

  return (
    <footer
      id={SIGNATURE_DOM_ID}
      data-architect={author}
      className="w-full flex justify-center items-center pt-0 pb-5 px-4 -mt-5 select-none"
    >
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1C6B53]/[0.06] dark:bg-emerald-950/40 border border-[#1C6B53]/15 dark:border-emerald-800/40 text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wide shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
        <span>
          Designed by{" "}
          <strong className="text-[#1C6B53] dark:text-emerald-400 font-black">
            {author}
          </strong>{" "}
          • © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
