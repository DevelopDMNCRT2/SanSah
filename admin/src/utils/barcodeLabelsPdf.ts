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

export const LABEL_FORMATS = {
  '50x25': { w: 50, h: 25, label: 'Rollo Térmico 50×25 mm' },
  '50x30': { w: 50, h: 30, label: 'Rollo Térmico 50×30 mm' },
  '58x40': { w: 58, h: 40, label: 'Rollo Térmico 58×40 mm' },
  'hoja':  { w: 215.9, h: 279.4, label: 'Hoja Carta (3×10)' },
} as const;

export type LabelFormat = keyof typeof LABEL_FORMATS;
export type ThermalRollFormat = '50x25' | '50x30' | '58x40';

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(val);
};

export const generateBarcodeDataUrl = (code: string): string => {
  const canvas = document.createElement('canvas');
  const safeCode = code && code.trim() ? code.trim() : '00000000';

  try {
    JsBarcode(canvas, safeCode, {
      format: 'CODE128',
      lineColor: '#000000',
      width: 2,
      height: 38,
      displayValue: true,
      font: 'monospace',
      fontSize: 12,
      fontOptions: 'bold',
      textMargin: 2,
      margin: 2,
      background: '#ffffff',
    });
  } catch (err) {
    console.warn('Error generating barcode for code:', safeCode, err);
    JsBarcode(canvas, safeCode.replace(/[^a-zA-Z0-9]/g, '') || '00000000', {
      format: 'CODE128',
      lineColor: '#000000',
      width: 2,
      height: 38,
      displayValue: true,
      font: 'monospace',
      fontSize: 12,
      fontOptions: 'bold',
      textMargin: 2,
      margin: 2,
      background: '#ffffff',
    });
  }
  return canvas.toDataURL('image/png');
};

/**
 * Genera el documento PDF de etiquetas para rollo térmico continuo
 * según el tamaño seleccionado: 50x25 mm, 50x30 mm o 58x40 mm.
 */
export const generateRolloLabelsDoc = (
  items: LabelItem[],
  format: ThermalRollFormat = '50x25'
): jsPDF => {
  const dimensions = LABEL_FORMATS[format] || LABEL_FORMATS['50x25'];
  const width = dimensions.w;
  const height = dimensions.h;

  const doc = new jsPDF({
    unit: 'mm',
    format: [width, height],
    orientation: 'landscape',
  });

  let isFirstPage = true;

  for (const item of items) {
    const copies = Math.max(1, item.cantidad || 1);
    const barcodeDataUrl = generateBarcodeDataUrl(item.codigoBarras);
    const hasVariant = !!(item.variante && item.variante.trim());

    for (let c = 0; c < copies; c++) {
      if (!isFirstPage) {
        doc.addPage([width, height], 'landscape');
      }
      isFirstPage = false;

      if (format === '50x25') {
        // --- FORMATO 50x25 mm ---
        // 1. Header institucional (margen seguro 3.2 mm)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(20, 20, 20);
        doc.text('SANSAH BIKES', width / 2, 3.2, { align: 'center' });

        // 2. Nombre del producto
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.2);
        doc.setTextColor(30, 30, 30);
        const splitTitle = doc.splitTextToSize(item.nombre, 44);

        let currentY = 5.8;
        if (hasVariant) {
          const titleText = splitTitle.length > 1 ? splitTitle[0] + '…' : splitTitle[0];
          doc.text(titleText, width / 2, currentY, { align: 'center' });
          currentY += 2.4;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.2);
          doc.setTextColor(80, 80, 80);
          const varText = item.variante!.length > 28 ? item.variante!.substring(0, 26) + '…' : item.variante!;
          doc.text(varText, width / 2, currentY, { align: 'center' });
          currentY += 1.2;
        } else {
          doc.text(splitTitle[0] || '', width / 2, currentY, { align: 'center' });
          if (splitTitle.length > 1) {
            currentY += 2.4;
            const secondLine = splitTitle.length > 2 ? splitTitle[1] + '…' : splitTitle[1];
            doc.text(secondLine, width / 2, currentY, { align: 'center' });
          }
          currentY += 1.2;
        }

        // 3. Código de barras centrado (44 mm ancho para máxima legibilidad a 203 DPI)
        const barcodeWidth = 44;
        const barcodeHeight = 9.2;
        const barcodeX = (width - barcodeWidth) / 2;
        const barcodeY = Math.max(currentY, 9.4);
        doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);

        // 4. Precio destacado al pie (margen inferior seguro 2.2 mm)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 15, 15);
        doc.text(formatCurrency(item.precio), width / 2, 22.8, { align: 'center' });

      } else if (format === '50x30') {
        // --- FORMATO 50x30 mm ---
        // 1. Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(20, 20, 20);
        doc.text('SANSAH BIKES', width / 2, 3.8, { align: 'center' });

        // 2. Nombre producto
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 30, 30);
        const splitTitle = doc.splitTextToSize(item.nombre, 44);

        let currentY = 6.6;
        doc.text(splitTitle[0] || '', width / 2, currentY, { align: 'center' });
        if (splitTitle.length > 1) {
          currentY += 2.7;
          const secondLine = splitTitle.length > 2 ? splitTitle[1] + '…' : splitTitle[1];
          doc.text(secondLine, width / 2, currentY, { align: 'center' });
        }

        // 3. Variante
        if (hasVariant) {
          currentY += 2.5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(80, 80, 80);
          const varText = item.variante!.length > 30 ? item.variante!.substring(0, 28) + '…' : item.variante!;
          doc.text(varText, width / 2, currentY, { align: 'center' });
        }

        // 4. Código de barras
        const barcodeWidth = 44;
        const barcodeHeight = 11.5;
        const barcodeX = (width - barcodeWidth) / 2;
        const barcodeY = Math.max(currentY + 1.2, 11.2);
        doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);

        // 5. Precio
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 15, 15);
        doc.text(formatCurrency(item.precio), width / 2, 27.6, { align: 'center' });

      } else {
        // --- FORMATO 58x40 mm ---
        // 1. Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(20, 20, 20);
        doc.text('SANSAH BIKES', width / 2, 4.8, { align: 'center' });

        // 2. Nombre producto
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(30, 30, 30);
        const splitTitle = doc.splitTextToSize(item.nombre, 52);

        let currentY = 8.2;
        doc.text(splitTitle[0] || '', width / 2, currentY, { align: 'center' });
        if (splitTitle.length > 1) {
          currentY += 3.2;
          const secondLine = splitTitle.length > 2 ? splitTitle[1] + '…' : splitTitle[1];
          doc.text(secondLine, width / 2, currentY, { align: 'center' });
        }

        // 3. Variante
        if (hasVariant) {
          currentY += 2.8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.2);
          doc.setTextColor(80, 80, 80);
          const varText = item.variante!.length > 34 ? item.variante!.substring(0, 32) + '…' : item.variante!;
          doc.text(varText, width / 2, currentY, { align: 'center' });
        }

        // 4. Código de barras (50 mm de ancho, 15 mm de alto)
        const barcodeWidth = 50;
        const barcodeHeight = 15;
        const barcodeX = (width - barcodeWidth) / 2;
        const barcodeY = Math.max(currentY + 1.5, 14.5);
        doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);

        // 5. Precio
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 15, 15);
        doc.text(formatCurrency(item.precio), width / 2, 36.8, { align: 'center' });
      }
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

  const flatLabels: { item: LabelItem; barcodeUrl: string }[] = [];
  for (const item of items) {
    const barcodeUrl = generateBarcodeDataUrl(item.codigoBarras);
    const copies = Math.max(1, item.cantidad || 1);
    for (let i = 0; i < copies; i++) {
      flatLabels.push({ item, barcodeUrl });
    }
  }

  flatLabels.forEach((entry, index) => {
    const pageIndex = index % labelsPerPage;

    if (index > 0 && pageIndex === 0) {
      doc.addPage('letter', 'portrait');
    }

    const col = pageIndex % cols;
    const row = Math.floor(pageIndex / cols);

    const x = marginLeft + col * (labelWidth + colGap);
    const y = marginTop + row * (labelHeight + rowGap);

    // Contorno sutil de etiqueta para guía de corte / despegue
    doc.setDrawColor(225, 225, 225);
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
    const displayName = splitName.length > 1 ? splitName[0] + '…' : splitName[0];
    doc.text(displayName || '', x + 2, y + 7);

    // Variante o subtexto
    let barcodeY = y + 10.5;
    if (entry.item.variante && entry.item.variante.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(90, 90, 90);
      const varTxt = entry.item.variante.length > 28 ? entry.item.variante.substring(0, 26) + '…' : entry.item.variante;
      doc.text(varTxt, x + 2, y + 9.8);
      barcodeY = y + 10.8;
    }

    // Código de barras
    const barcodeW = labelWidth - 6;
    const barcodeH = 12.8;
    const barcodeX = x + (labelWidth - barcodeW) / 2;
    doc.addImage(entry.barcodeUrl, 'PNG', barcodeX, barcodeY, barcodeW, barcodeH);
  });

  return doc;
};

/**
 * Disparador unificado para imprimir etiquetas según formato seleccionado.
 */
export const printBarcodeLabels = (
  items: LabelItem[],
  format: LabelFormat = '50x25'
): void => {
  if (!items || items.length === 0) return;

  const doc = format === 'hoja'
    ? generateHojaLabelsDoc(items)
    : generateRolloLabelsDoc(items, format as ThermalRollFormat);

  doc.autoPrint();

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    doc.save(`etiquetas_productos_${format}.pdf`);
  }
};
