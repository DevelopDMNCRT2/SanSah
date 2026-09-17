import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SANSAH_LOGO_B64 } from '@/utils/pdfBrand';

export interface TicketItem {
  nombre: string;
  variante?: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface TicketData {
  orderNum: string | number;
  fecha?: string;
  cliente?: string;
  metodoPago: string;
  canal?: string;
  items: TicketItem[];
  subtotal: number;
  impuestos?: number;
  total: number;
  nota?: string;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(val);
};

export const generateThermalTicketDoc = (data: TicketData): jsPDF => {
  // Ancho estándar de rollo térmico de 80 mm
  const pageWidth = 80;
  const baseHeight = 135;
  const itemsHeight = data.items.length * 7;
  const notesHeight = data.nota ? 10 : 0;
  const pageHeight = Math.max(150, baseHeight + itemsHeight + notesHeight);

  const doc = new jsPDF({
    unit: 'mm',
    format: [pageWidth, pageHeight],
    orientation: 'portrait',
  });

  const marginX = 4;
  const contentWidth = pageWidth - marginX * 2;
  const centerX = pageWidth / 2;
  let cursorY = 5;

  // 1. Logo institucional
  try {
    const logoWidth = 32;
    const logoHeight = 13;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(SANSAH_LOGO_B64, 'PNG', logoX, cursorY, logoWidth, logoHeight);
    cursorY += logoHeight + 3;
  } catch {
    cursorY += 2;
  }

  // 2. Encabezado comercial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('SANSAH BIKES', centerX, cursorY, { align: 'center' });
  cursorY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Bicicletas, Refacciones y Taller Especializado', centerX, cursorY, { align: 'center' });
  cursorY += 3.5;
  doc.text('Tienda Matriz / Punto de Venta', centerX, cursorY, { align: 'center' });
  cursorY += 3.5;
  doc.text('RFC: SAA-220101-000', centerX, cursorY, { align: 'center' });
  cursorY += 4;

  // Separador punteado
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.setLineWidth(0.2);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 4;

  // 3. Metadatos de la venta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(`TICKET DE VENTA: #${data.orderNum}`, marginX, cursorY);
  cursorY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 50);

  const fechaStr = data.fecha || new Date().toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  doc.text(`Fecha: ${fechaStr}`, marginX, cursorY);
  cursorY += 3.5;

  const canalStr = data.canal || 'POS / Mostrador';
  doc.text(`Canal: ${canalStr}`, marginX, cursorY);
  cursorY += 3.5;

  if (data.cliente && data.cliente.trim() !== '') {
    doc.text(`Cliente: ${data.cliente}`, marginX, cursorY);
    cursorY += 3.5;
  }

  // Separador
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 2;

  // 4. Tabla de artículos
  const tableRows = data.items.map((item) => {
    let desc = item.nombre;
    if (item.variante && item.variante.trim() !== '') {
      desc += ` (${item.variante})`;
    }
    return [
      String(item.cantidad),
      desc,
      formatCurrency(item.precio),
      formatCurrency(item.subtotal),
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [['Cant', 'Descripción', 'P.Unit', 'Total']],
    body: tableRows,
    theme: 'plain',
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    headStyles: {
      textColor: [20, 20, 20],
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'left',
      cellPadding: { top: 1.5, bottom: 1.5, left: 0.5, right: 0.5 },
      lineWidth: { top: 0.2, bottom: 0.2 },
      lineColor: [100, 100, 100],
    },
    styles: {
      fontSize: 6.5,
      textColor: [40, 40, 40],
      cellPadding: { top: 1, bottom: 1, left: 0.5, right: 0.5 },
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 35, halign: 'left' },
      2: { cellWidth: 15, halign: 'right' },
      3: { cellWidth: 15, halign: 'right', fontStyle: 'bold' },
    },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 2;

  // Separador
  doc.setLineDashPattern([1, 1], 0);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 3.5;

  // 5. Totales
  const colLeft = marginX + 22;
  const colRight = pageWidth - marginX;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);

  // Subtotal
  doc.text('Subtotal:', colLeft, cursorY);
  doc.text(formatCurrency(data.subtotal), colRight, cursorY, { align: 'right' });
  cursorY += 3.5;

  // IVA (16% informativo)
  const iva = data.impuestos ?? (data.total - data.subtotal > 0 ? data.total - data.subtotal : (data.total * 0.16) / 1.16);
  doc.text('IVA (16% Incluido):', colLeft, cursorY);
  doc.text(formatCurrency(iva), colRight, cursorY, { align: 'right' });
  cursorY += 4.5;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('TOTAL:', colLeft, cursorY);
  doc.text(formatCurrency(data.total), colRight, cursorY, { align: 'right' });
  cursorY += 4.5;

  // Método de pago
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 50);
  doc.text(`Método de Pago: ${data.metodoPago}`, marginX, cursorY);
  cursorY += 4;

  if (data.nota) {
    doc.setFontSize(6.5);
    doc.text(`Nota: ${data.nota}`, marginX, cursorY, { maxWidth: contentWidth });
    cursorY += 5;
  }

  // Separador
  doc.setLineDashPattern([1, 1], 0);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 4;

  // 6. Políticas de garantía y despedida
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(20, 20, 20);
  doc.text('--- POLÍTICAS DE GARANTÍA ---', centerX, cursorY, { align: 'center' });
  cursorY += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(70, 70, 70);
  doc.text('1. Garantía de 30 días en defectos de fábrica.', centerX, cursorY, { align: 'center' });
  cursorY += 3;
  doc.text('2. No aplica en cámaras, parches o desgaste normal.', centerX, cursorY, { align: 'center' });
  cursorY += 3;
  doc.text('3. Indispensable presentar este ticket para cualquier cambio.', centerX, cursorY, { align: 'center' });
  cursorY += 3;
  doc.text('4. En servicio de taller, 7 días de ajuste de garantía.', centerX, cursorY, { align: 'center' });
  cursorY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 20, 20);
  doc.text('¡GRACIAS POR SU COMPRA!', centerX, cursorY, { align: 'center' });
  cursorY += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('www.sansahbikes.com', centerX, cursorY, { align: 'center' });

  return doc;
};

export const printThermalTicket = (data: TicketData): void => {
  const doc = generateThermalTicketDoc(data);
  doc.autoPrint();

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    doc.save(`ticket_${data.orderNum}.pdf`);
  }
};
