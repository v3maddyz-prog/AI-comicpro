import { jsPDF } from 'jspdf';
import { ComicStory, ComicPanel } from '../types/comic';

// Helper to convert an image URL or create a fallback canvas data URL
async function getImageDataUrl(url: string, fallbackTitle: string): Promise<string> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(createFallbackPanelDataUrl(fallbackTitle));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(createFallbackPanelDataUrl(fallbackTitle));
        }
      } catch (e) {
        console.warn('Canvas export failed for image, using fallback:', e);
        resolve(createFallbackPanelDataUrl(fallbackTitle));
      }
    };
    img.onerror = () => {
      resolve(createFallbackPanelDataUrl(fallbackTitle));
    };

    // If already data URL
    if (url.startsWith('data:')) {
      resolve(url);
    } else {
      img.src = url;
    }
  });
}

function createFallbackPanelDataUrl(title: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Vintage comic gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 600);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);

    // Comic dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 10; x < 600; x += 20) {
      for (let y = 10; y < 600; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 580, 580);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 300, 300);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '18px sans-serif';
    ctx.fillText('COMICCRAFT ILLUSTRATION', 300, 340);
  }
  return canvas.toDataURL('image/png');
}

export async function generateComicPDF(
  comic: ComicStory,
  onProgress?: (percent: number, msg: string) => void
): Promise<void> {
  onProgress?.(10, 'Preparing comic pages...');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;

  // Pre-load all panel images
  onProgress?.(25, 'Processing panel illustrations...');
  const panelImageData: string[] = [];
  for (let i = 0; i < comic.panels.length; i++) {
    const p = comic.panels[i];
    onProgress?.(25 + Math.floor((i / comic.panels.length) * 35), `Loading panel ${i + 1} art...`);
    const imgData = await getImageDataUrl(p.image_url || '', p.title);
    panelImageData.push(imgData);
  }

  // --- PAGE 1: COVER PAGE ---
  onProgress?.(65, 'Designing comic cover...');

  // Dark comic cover background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Comic Header Banner
  doc.setFillColor(245, 158, 11); // Amber
  doc.rect(margin, margin, pageWidth - margin * 2, 16, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, pageWidth - margin * 2, 16, 'S');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('COMICCRAFT AI STUDIOS • SPECIAL COLLECTOR’S EDITION', pageWidth / 2, margin + 7, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`ISSUE #${comic.issue_number || 1}  •  ${comic.art_style.toUpperCase()}  •  GENRE: ${comic.tone.toUpperCase()}`, pageWidth / 2, margin + 12, { align: 'center' });

  // Main Comic Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  const titleLines = doc.splitTextToSize(comic.title.toUpperCase(), pageWidth - margin * 2 - 10);
  doc.text(titleLines, pageWidth / 2, margin + 28, { align: 'center' });

  // Cover Feature Image (Panel 1)
  const coverImageY = margin + 38;
  const coverImageW = pageWidth - margin * 2;
  const coverImageH = 135;

  if (panelImageData[0]) {
    try {
      doc.addImage(panelImageData[0], 'JPEG', margin, coverImageY, coverImageW, coverImageH);
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(1.2);
      doc.rect(margin, coverImageY, coverImageW, coverImageH, 'S');
    } catch (e) {
      console.warn('Could not add cover image to PDF:', e);
    }
  }

  // Logline Box
  const loglineBoxY = coverImageY + coverImageH + 6;
  doc.setFillColor(24, 24, 27);
  doc.rect(margin, loglineBoxY, pageWidth - margin * 2, 28, 'F');
  doc.setDrawColor(75, 85, 99);
  doc.setLineWidth(0.5);
  doc.rect(margin, loglineBoxY, pageWidth - margin * 2, 28, 'S');

  doc.setTextColor(245, 158, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('THE PREMISE:', margin + 4, loglineBoxY + 6);

  doc.setTextColor(228, 228, 231);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const loglineLines = doc.splitTextToSize(`"${comic.logline}"`, pageWidth - margin * 2 - 8);
  doc.text(loglineLines, margin + 4, loglineBoxY + 12);

  // Cast & Details Section
  const castBoxY = loglineBoxY + 32;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('STARRING:', margin, castBoxY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(209, 213, 219);
  let castText = comic.characters.map((c) => `${c.name} (${c.description})`).join('  |  ');
  const castLines = doc.splitTextToSize(castText, pageWidth - margin * 2);
  doc.text(castLines, margin, castBoxY + 9);

  // Footer credits
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `Story by: ${comic.author || 'ComicCraft Story AI'}  •  Setting: ${comic.setting}  •  Generated on ComicCraft`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // --- INTERIOR PAGES: 2 PANELS PER PAGE ---
  onProgress?.(80, 'Formatting comic panel pages...');

  const panels = comic.panels;
  const panelsPerPage = 2;
  const numPages = Math.ceil(panels.length / panelsPerPage);

  for (let pageIdx = 0; pageIdx < numPages; pageIdx++) {
    doc.addPage();

    // Vintage paper background
    doc.setFillColor(253, 251, 247); // warm comic page paper
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Page Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`${comic.title.toUpperCase()}  •  ISSUE #${comic.issue_number || 1}`, margin, 8);
    doc.text(`PAGE ${pageIdx + 1} OF ${numPages}`, pageWidth - margin, 8, { align: 'right' });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, 10, pageWidth - margin, 10);

    const startIdx = pageIdx * panelsPerPage;
    const pagePanels = panels.slice(startIdx, startIdx + panelsPerPage);

    // Height calculation for 2 panels per page
    const totalPanelAreaHeight = pageHeight - 24 - margin;
    const panelHeight = (totalPanelAreaHeight - 10) / 2;
    const panelWidth = pageWidth - margin * 2;

    for (let i = 0; i < pagePanels.length; i++) {
      const panel = pagePanels[i];
      const panelGlobalIdx = startIdx + i;
      const panelY = 14 + i * (panelHeight + 8);

      // Black comic panel gutter border
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, panelY, panelWidth, panelHeight, 'F');

      // Panel image (takes left portion or full background)
      const imgData = panelImageData[panelGlobalIdx];
      const imageW = panelHeight * 1.05; // squarish
      const imageH = panelHeight;

      if (imgData) {
        try {
          doc.addImage(imgData, 'JPEG', margin, panelY, imageW, imageH);
        } catch (e) {
          console.warn('Failed to add panel image:', e);
        }
      }

      // Script / Narration / Dialogue Column on the right
      const scriptX = margin + imageW + 3;
      const scriptW = panelWidth - imageW - 6;

      // Panel Number and Title Badge
      doc.setFillColor(0, 0, 0);
      doc.rect(scriptX, panelY + 2, scriptW, 7, 'F');
      doc.setTextColor(245, 158, 11); // Amber
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`PANEL ${panel.panel_number}: ${panel.title.toUpperCase()}`, scriptX + 3, panelY + 6.8);

      let currentTextY = panelY + 13;

      // Narration Box (Classic comic yellow box)
      if (panel.narration) {
        doc.setFillColor(254, 240, 138); // light amber / comic yellow
        doc.rect(scriptX, currentTextY, scriptW, 16, 'F');
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.rect(scriptX, currentTextY, scriptW, 16, 'S');

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        const narrLines = doc.splitTextToSize(panel.narration, scriptW - 4);
        doc.text(narrLines, scriptX + 2, currentTextY + 5);

        currentTextY += 19;
      }

      // Dialogue Speech Bubbles
      if (panel.dialogue && panel.dialogue.length > 0) {
        panel.dialogue.forEach((d) => {
          const bubbleHeight = 16;
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(scriptX, currentTextY, scriptW, bubbleHeight, 2, 2, 'F');
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.4);
          doc.roundedRect(scriptX, currentTextY, scriptW, bubbleHeight, 2, 2, 'S');

          // Character name in bold
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(180, 83, 9); // amber-700
          doc.text(`${d.character.toUpperCase()}:`, scriptX + 3, currentTextY + 4.5);

          // Dialogue text
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(0, 0, 0);
          const dLines = doc.splitTextToSize(`"${d.text}"`, scriptW - 6);
          doc.text(dLines, scriptX + 3, currentTextY + 9);

          currentTextY += bubbleHeight + 3;
        });
      }

      // Scene description footer inside panel
      if (panel.scene_description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(110, 110, 110);
        const sceneLines = doc.splitTextToSize(`Scene: ${panel.scene_description}`, scriptW);
        doc.text(sceneLines, scriptX, panelY + panelHeight - 3);
      }

      // Panel Outer Thick Border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.rect(margin, panelY, panelWidth, panelHeight, 'S');
    }

    // Page footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('Created with ComicCraft • AI Comic Book Studio', pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  onProgress?.(95, 'Finalizing PDF document...');

  // Save the PDF
  const safeFilename = `${comic.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_issue_${comic.issue_number || 1}.pdf`;
  doc.save(safeFilename);

  onProgress?.(100, 'Download starting!');
}
