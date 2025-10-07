/* eslint-disable no-alert */
// Shared print utilities to produce reliable, consistent print output across the app
// - Ensures linked stylesheets and web fonts finish loading before triggering print
// - Hides non-print UI via provided stylesheets (e.g., professional-print-styles.css)
// - Closes the print window after the print dialog when appropriate

export function printHtmlDocument(title, bodyHtml, options = {}) {
  const { stylesheets = [], inlineHeadCss = '', width = 1200, height = 800, printDelayMs = 100 } = options;
  const features = `width=${width},height=${height},noopener,noreferrer`;
  const printWindow = window.open('', '_blank', features);
  if (!printWindow) {
    console.error('Could not open print window. Popup may be blocked.');
    alert('Please allow popups to print.');
    return null;
  }

  const linksHtml = stylesheets
    .map((href) => `<link rel="stylesheet" href="${href}" media="all">`)
    .join('');

  printWindow.document.write(`<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title || 'Print'}</title>
    ${linksHtml}
    <style>${inlineHeadCss || ''}</style>
  </head>
  <body>
    ${bodyHtml || ''}
  </body>
  </html>`);
  printWindow.document.close();

  const waitForAssets = async () => {
    // Wait for DOM ready in the print window
    if (printWindow.document.readyState !== 'complete') {
      await new Promise((resolve) => printWindow.addEventListener('load', resolve, { once: true }));
    }

    // Wait for stylesheets to finish loading
    const linkElements = Array.from(printWindow.document.querySelectorAll('link[rel="stylesheet"]'));
    await Promise.all(
      linkElements.map((link) => {
        if (link.sheet) return Promise.resolve();
        return new Promise((resolve) => {
          link.addEventListener('load', resolve, { once: true });
          link.addEventListener('error', resolve, { once: true });
        });
      })
    );

    // Wait for fonts (if supported)
    try {
      if (printWindow.document.fonts && printWindow.document.fonts.ready) {
        await printWindow.document.fonts.ready;
      }
    } catch (_) {
      // ignore font readiness errors
    }

    // Small delay to ensure layout settles
    await new Promise((r) => setTimeout(r, printDelayMs));
  };

  const triggerPrint = async () => {
    await waitForAssets();
    printWindow.focus();
    const closeAfterPrint = () => {
      try { printWindow.close(); } catch (err) { console.debug('Failed to close print window', err); }
    };
    // Best effort close after printing
    printWindow.addEventListener('afterprint', closeAfterPrint, { once: true });
    try {
      printWindow.print();
      // Fallback in case afterprint is not fired
      setTimeout(closeAfterPrint, 1500);
    } catch (e) {
      // As a fallback, attempt again shortly
      setTimeout(() => {
        try { printWindow.print(); } finally { setTimeout(closeAfterPrint, 1500); }
      }, 250);
    }
  };

  triggerPrint();
  return printWindow;
}

export function printElementContent(title, element, options = {}) {
  if (!element) {
    console.error('printElementContent: element not found');
    return null;
  }
  return printHtmlDocument(title, element.innerHTML, options);
}


