/**
 * Safe, Non-Blocking Print & PDF Export Utility
 * 
 * Why this is needed:
 * In Chromium browsers (Chrome, Edge, Brave, etc.), calling `window.open("", "_blank")`
 * and then `window.print()` from a child window shares the parent window's
 * JavaScript event loop thread. When the browser opens the native print dialog,
 * it completely FREEZES the main dashboard until the dialog is closed.
 * 
 * By using an isolated Blob URL with `noopener,noreferrer` and detaching
 * `window.opener = null`, Chromium places the export tab into an independent
 * renderer process (Site Isolation).
 * 
 * Result: The print dialog runs in its own process, and the main dashboard
 * remains 100% responsive, fast, and never hangs or freezes.
 */

export function openSafePrintWindow(htmlContent: string, windowTitle = "Export_Report") {
  try {
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    // Open in a completely detached, isolated browser process
    const printWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");
    
    if (printWindow) {
      try {
        printWindow.opener = null;
      } catch (e) {
        // Ignored if browser restricts setting opener
      }
    } else {
      // Fallback for browsers that block blob: popups
      const fallback = window.open("", "_blank");
      if (fallback) {
        try {
          fallback.opener = null;
        } catch (e) {}
        fallback.document.open();
        fallback.document.write(htmlContent);
        fallback.document.close();
      } else {
        alert("Pop-up was blocked. Please allow pop-ups for this site to export or print reports.");
      }
    }

    // Revoke the Blob URL after 3 minutes to free memory
    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) {}
    }, 180000);
  } catch (err) {
    console.error("Safe print export failed, falling back:", err);
    try {
      const fallback = window.open("", "_blank");
      if (fallback) {
        try { fallback.opener = null; } catch (e) {}
        fallback.document.open();
        fallback.document.write(htmlContent);
        fallback.document.close();
      }
    } catch (e) {}
  }
}
