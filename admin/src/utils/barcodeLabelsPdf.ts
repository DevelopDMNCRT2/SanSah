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
      height: 36,
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
      height: 36,
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
 * Genera el documento PDF de etiquetas para rollo térmico continuo a 50mm x 25mm.
 * Cada etiqueta es una página individual, compatible universalmente con rollos
 * de 50x25 mm, 50x30 mm o 58x40 mm sin desbordarse.
 */
export const generateRolloLabelsDoc = (items: LabelItem[]): jsPDF => {
  const width = 50;
  const height = 25;

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
      doc.setFontSize(6);
      doc.setTextColor(20, 20, 20);
      doc.text('SANSAH BIKES', width / 2, 3.2, { align: 'center' });

      // 2. Nombre del producto (1 línea legible truncada a 44 mm)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(30, 30, 30);
      const splitTitle = doc.splitTextToSize(item.nombre, 44);
      doc.text(splitTitle[0] || '', width / 2, 6.2, { align: 'center' });

      // 3. Variante (si aplica)
      const hasVariant = !!(item.variante && item.variante.trim());
      if (hasVariant) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(80, 80, 80);
        const varText = item.variante!.length > 28 ? item.variante!.substring(0, 26) + '...' : item.variante!;
        doc.text(varText, width / 2, 8.8, { align: 'center' });
      }

      // 4. Código de barras centrado
      const barcodeWidth = 42;
      const barcodeHeight = 10;
      const barcodeX = (width - barcodeWidth) / 2;
      const barcodeY = hasVariant ? 9.8 : 7.8;
      doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);

      // 5. Precio destacado al pie
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 15, 15);
      doc.text(formatCurrency(item.precio), width / 2, 23.2, { align: 'center' });
    }
  }

  return doc;
};

/**
 * Disparador unificado para imprimir etiquetas en rollo térmico universal (50mm x 25mm).
 */
export const printBarcodeLabels = (items: LabelItem[]): void => {
  if (!items || items.length === 0) return;

  const doc = generateRolloLabelsDoc(items);
  doc.autoPrint();

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    doc.save(`etiquetas_productos_50x25.pdf`);
  }
};
