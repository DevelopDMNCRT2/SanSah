import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';

export interface LabelItem {
  id?: number | string;
  nombre: string;
  variante?: string;
  precio: number;
  codigoBarras: string;
  cantidad: number;
}

export type LabelFormat = 'rollo' | 'hoja';

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(val);
};

export const generateBarcodeDataUrl = (code: string): string => {
  const canvas = document.createElement('canvas');
  const safeCode = (code && code.trim()) ? code.trim() : '00000000';
  
  try {
    JsBarcode(canvas, safeCode, {
      format: 'CODE128',
      lineColor: '#000000',
      width: 2,
      height: 40,
      displayValue: true,
      font: 'monospace',
      fontSize: 13,
      fontOptions: 'bold',
      textMargin: 2,
      margin: 2,
      background: '#ffffff',
    });
  } catch (err) {
    console.warn('Error generating barcode for code:', safeCode, err);
    // Fallback if specific chars fail in CODE128
    JsBarcode(canvas, safeCode.replace(/[^a-zA-Z0-9]/g, '') || '00000000', {
      format: 'CODE128',
      lineColor: '#000000',
      width: 2,
      height: 40,
      displayValue: true,
      font: 'monospace',
      fontSize: 13,
      fontOptions: 'bold',
      textMargin: 2,
      margin: 2,
      background: '#ffffff',
    });
  }
  return canvas.toDataURL('image/png');
};

/**
 * Genera e imprime etiquetas para rollo térmico continuo (58mm x 40mm).
 * Cada etiqueta es una página individual optimizada para impresoras de etiquetas térmicas.
 */
export const generateRolloLabelsDoc = (items: LabelItem[]): jsPDF => {
  const width = 58;
  const height = 40;

  const doc = new jsPDF({
    unit: 'mm',
    format: [width, height],
    orientation: 'landscape',
  });

  let isFirstPage = true;

  for (const item of items) {
    const copies = Math.max(1, item.cantidad || 1);
    const barcodeDataUrl = generateBarcodeDataUrl(item.codigoBarras);

    for (let c = 0; c < copies; c++) {
      if (!isFirstPage) {
        doc.addPage([width, height], 'landscape');
      }
      isFirstPage = false;

      // 1. Header institucional
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(20, 20, 20);
      doc.text('SANSAH BIKES', width / 2, 4.5, { align: 'center' });

      // 2. Nombre del producto (máximo 2 líneas o truncado)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      const splitTitle = doc.splitTextToSize(item.nombre, 52);
      const displayTitle = splitTitle.slice(0, 2);
      doc.text(displayTitle, width / 2, 8, { align: 'center' });

      let currentY = 8 + (displayTitle.length * 3.2);

      // 3. Variante (si aplica)
      if (item.variante && item.variante.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(80, 80, 80);
        const varText = item.variante.length > 32 ? item.variante.substring(0, 30) + '...' : item.variante;
        doc.text(varText, width / 2, currentY, { align: 'center' });
        currentY += 2.8;
      }

      // 4. Código de barras (centrado)
      const barcodeWidth = 48;
      const barcodeHeight = 15;
      const barcodeX = (width - barcodeWidth) / 2;
      doc.addImage(barcodeDataUrl, 'PNG', barcodeX, currentY, barcodeWidth, barcodeHeight);
      currentY += barcodeHeight + 2.5;

      // 5. Precio destacado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 15, 15);
      doc.text(formatCurrency(item.precio), width / 2, Math.min(38, currentY), { align: 'center' });
    }
  }

  return doc;
};

/**
 * Genera e imprime etiquetas en hoja tamaño Carta (cuadrícula 3x10 = 30 etiquetas por hoja).
 * Compatible con hojas de etiquetas autoadheribles convencionales (ej. tipo Avery 5160).
 */
export const generateHojaLabelsDoc = (items: LabelItem[]): jsPDF => {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
  });

  const cols = 3;
  const rows = 10;
  const labelsPerPage = cols * rows;

  const labelWidth = 64;
  const labelHeight = 25.4;
  const marginTop = 11;
  const marginLeft = 7.5;
  const colGap = 3;
  const rowGap = 0;

  // Flatten items according to quantity
  const flatLabels: { item: LabelItem; barcodeUrl: string }[] = [];
  for (const item of items) {
    const barcodeUrl = generateBarcodeDataUrl(item.codigoBarras);
    const copies = Math.max(1, item.cantidad || 1);
    for (let i = 0; i < copies; i++) {
      flatLabels.push({ item, barcodeUrl });
    }
  }

  let isFirstPage = true;

  flatLabels.forEach((entry, index) => {
    const pageIndex = index % labelsPerPage;

    if (index > 0 && pageIndex === 0) {
      doc.addPage('letter', 'portrait');
    }
    isFirstPage = false;

    const col = pageIndex % cols;
    const row = Math.floor(pageIndex / cols);

    const x = marginLeft + col * (labelWidth + colGap);
    const y = marginTop + row * (labelHeight + rowGap);

    // Contorno sutil de etiqueta para guía
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.roundedRect(x, y, labelWidth, labelHeight, 1, 1, 'S');

    // Cabecera etiqueta: SANSAH BIKES (izq) y Precio (der)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(60, 60, 60);
    doc.text('SANSAH BIKES', x + 2, y + 3.5);

    doc.setFontSize(7.5);
    doc.setTextColor(20, 20, 20);
    doc.text(formatCurrency(entry.item.precio), x + labelWidth - 2, y + 3.8, { align: 'right' });

    // Nombre producto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 30, 30);
    const splitName = doc.splitTextToSize(entry.item.nombre, labelWidth - 4);
    doc.text(splitName[0] || '', x + 2, y + 7);

    // Variante o subtexto
    if (entry.item.variante && entry.item.variante.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(90, 90, 90);
      const varTxt = entry.item.variante.length > 28 ? entry.item.variante.substring(0, 26) + '...' : entry.item.variante;
      doc.text(varTxt, x + 2, y + 9.8);
    }

    // Código de barras
    const barcodeW = labelWidth - 6;
    const barcodeH = 13;
    const barcodeX = x + (labelWidth - barcodeW) / 2;
    const barcodeY = y + 10.5;
    doc.addImage(entry.barcodeUrl, 'PNG', barcodeX, barcodeY, barcodeW, barcodeH);
  });

  return doc;
};

/**
 * Disparador unificado para imprimir etiquetas según formato.
 */
export const printBarcodeLabels = (items: LabelItem[], format: LabelFormat = 'rollo'): void => {
  if (!items || items.length === 0) return;

  const doc = format === 'hoja' ? generateHojaLabelsDoc(items) : generateRolloLabelsDoc(items);
  doc.autoPrint();

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    doc.save(`etiquetas_productos_${format}.pdf`);
  }
};
