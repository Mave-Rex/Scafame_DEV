// src/app/services/delivery-certificate-report.service.ts
import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import ExcelJS from 'exceljs';

export type DeliveryReportFormat = 'pdf' | 'excel';

export interface DeliveryExportOptions {
  format: DeliveryReportFormat;
  author?: string;
  role?: string;
  logoPath?: string;           // p.ej. '/fame_logo.png'
  websiteText?: string;        // default: 'www.fame.ec'
  matrizTitle?: string;        // default: 'PUNTO DE VENTA MATRIZ'
  matrizAddress?: string;      // default: 'Dirección: Av. General Rumiñahui, Sangolquí 171103. (Junto a la ESPE)'
  puntoQuito?: string;         // default: 'PUNTO DE VENTA QUITO'
  puntoGuayaquil?: string;     // default: 'PUNTO DE VENTA GUAYAQUIL'
  deliveredByName?: string;    // nombre que firmará como ENTREGADO POR
  deliveredByTitle?: string;   // cargo de ENTREGADO POR (jobTitle)
}

@Injectable({ providedIn: 'root' })
export class DeliveryReportService {
  // valores opcionales para "ENTREGADO POR"
  private optDeliveredByName: string | null | undefined = null;
  private optDeliveredByTitle: string | null | undefined = null;

  /** Entrada pública: genera un acta (PDF o Excel) para un reporte individual */
  async exportActa(report: any, opts: DeliveryExportOptions): Promise<void> {
    // Permite override limpio del bloque "ENTREGADO POR"
    this.optDeliveredByName = opts.deliveredByName ?? null;
    this.optDeliveredByTitle = opts.deliveredByTitle ?? null;

    const data = this.normalizeReport(report);

    // Carga de logo (si se provee un path)
    const logoBase64 = opts.logoPath
      ? await this.loadImageAsBase64(opts.logoPath).catch(() => null)
      : null;

    if (opts.format === 'pdf') {
      await this.exportPdf(data, { ...opts }, logoBase64 || undefined);
    } else {
      await this.exportExcel(data, { ...opts }, logoBase64 || undefined);
    }
  }

  // ----------------- Normalización -----------------
  private normalizeReport(r: any) {
  const fecha = r?.createdAt ? new Date(r.createdAt) : new Date();
  const numeroActa =
    r?.code ?? r?.actNumber ?? `ACTA-${String(r?.id ?? 'XXX').padStart(4, '0')}`;

  // Detectar tipo de reporte
  const isOutcome = r?.type === 'outcome' || r?.type === 'OUTCOME';

  // Usuario responsable / aprobador (INCOME o aprobador de OUTCOME)
  const user = r?.user || {};
  // Usuario solicitante (solo OUTCOME)
  const requested = r?.requestedBy || {};

  const buildFullName = (obj: any): string =>
    `${obj?.firstname ?? ''} ${obj?.lastname ?? ''}`.trim();

  // ----- SOLICITANTE -----
  const solicitante = isOutcome
    ? buildFullName(requested) ||
      requested.fullName ||
      requested.username ||
      '—'
    : '—'; // INCOME no tiene solicitante

  // ----- RECIBIDO POR -----
  const recibidoNombre = isOutcome
    ? buildFullName(requested) ||
      requested.fullName ||
      requested.username ||
      '__________________________'
    : buildFullName(user) ||
      user.fullName ||
      user.username ||
      '__________________________';

  const recibidoCargo = isOutcome
    ? requested.jobTitle || requested.title || '—'
    : user.jobTitle || user.title || '—';

  // ----- ENTREGADO POR -----
  const entregadoNombre =
    this.optDeliveredByName ||
    buildFullName(user) ||
    user.fullName ||
    user.username ||
    '__________________________';

  const entregadoCargo =
    this.optDeliveredByTitle ||
    user.jobTitle ||
    user.title ||
    '—';

  // ----- ÁREA -----
  // 1) OUTCOME → prioriza área del solicitante
  // 2) INCOME → usa área del user responsable
  // 3) Fallback → área directa del reporte si existiera
  const area =
    requested?.area?.name ||
    requested?.area?.nombre ||
    requested?.area ||
    user?.area?.name ||
    user?.area?.nombre ||
    user?.area ||
    r?.area?.name ||
    r?.area?.nombre ||
    r?.area ||
    '—';

  const items = this.extractItems(r);

  return {
    fecha,
    numeroActa,
    solicitante,
    area,
    items,
    recibidoNombre,
    recibidoCargo,
    entregadoNombre,
    entregadoCargo,
  };
}

  private extractItems(r: any) {
    const rows: Array<{ index: number; sku: string; name: string; unit: string; qty: number }> = [];
    let i = 1;

    const pushItem = (it: any) => {
      const rawSku =
        it?.product?.id ??
        it?.productId ??
        it?.id ??
        '';

      // ← Formatear a 11 dígitos si es numérico
      const sku = this.pad11(rawSku);

      const name =
        it?.product?.name || it?.product?.nombre || it?.name || it?.nombre || '';
      // unidad como texto (evita [object Object])
      const unitObj = it?.product?.unit;
      const unit =
        it?.unit || it?.unidad ||
        unitObj?.abbreviation || unitObj?.name || 'Unidad';
      const qty = Number(it?.quantity ?? it?.cantidad ?? it?.qty ?? 0);

      if (name && qty) {
        rows.push({
          index: i++,
          sku: String(sku || ''),
          name: String(name),
          unit: String(unit),
          qty
        });
      }
    };

    // Fuentes conocidas desde el backend/frontend
    if (Array.isArray(r?.ProductReports)) r.ProductReports.forEach(pushItem); // backend Nest: relación con P mayúscula
    if (Array.isArray(r?.productReports)) r.productReports.forEach(pushItem);
    if (Array.isArray(r?.items)) r.items.forEach(pushItem);
    if (Array.isArray(r?.products)) r.products.forEach(pushItem);
    if (!rows.length && r?.product) pushItem(r); // fallback defensivo

    return rows;
  }

  // ----------------- PDF (jsPDF) -----------------
  private async exportPdf(
    data: ReturnType<DeliveryReportService['normalizeReport']>,
    opt: DeliveryExportOptions,
    logoBase64?: string
  ): Promise<void> {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const left = 40;
    let y = 40;

    // Logo en esquina superior izquierda
    const logoW = 140, logoH = 48;
    if (logoBase64) {
      try { doc.addImage(logoBase64, 'PNG', left, y, logoW, logoH, undefined, 'FAST'); } catch {}
    }

    let yAfterHeader = y + Math.max(logoH, 52) + 28;

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ACTA DE ENTREGA DE SUMINISTROS', pageWidth / 2, yAfterHeader, { align: 'center' });
    yAfterHeader += 22;

    // Metadatos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const meta = [
      ['Fecha:', this.formatDate(data.fecha)],
      ['Nº de Acta:', data.numeroActa],
      ['Solicitante:', data.solicitante],
      ['Área:', data.area],
    ];
    let yMeta = yAfterHeader;
    meta.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');   doc.text(String(k), left, yMeta);
      doc.setFont('helvetica', 'normal'); doc.text(String(v), left + 80, yMeta);
      yMeta += 16;
    });

    // Tabla
    const head = [['N°', 'Código', 'Producto', 'Unidad', 'Cantidad']];
    const body: RowInput[] = data.items.map(it => [it.index, it.sku || '—', it.name, it.unit, it.qty]);
    autoTable(doc, {
      head,
      body,
      startY: yMeta + 6,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 6,
        lineColor: [0,0,0],
        lineWidth: 0.5,
        textColor: [0,0,0],
      },
      headStyles: { fillColor: [255,255,255], textColor: [0,0,0], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 110 },
        2: { cellWidth: 240 },
        3: { cellWidth: 90 },
        4: { cellWidth: 70, halign: 'right' }
      },
      margin: { left, right: left }
    });

    const afterTableY = (doc as any).lastAutoTable?.finalY ?? (yMeta + 40);

    // ---------- TEXTO + FIRMAS + FOOTER CON CONTROL DE PÁGINA ----------
    const text =
      'Los artículos descritos en la presente acta han sido entregados en conformidad para uso exclusivo ' +
      'en las actividades de la empresa, siendo responsabilidad del solicitante su uso y custodia.';

    const split = doc.splitTextToSize(text, pageWidth - left * 2);
    const pageHeight = doc.internal.pageSize.getHeight();

    // Alturas aproximadas
    const textLineHeight = 12;
    const textBlockHeight = split.length * textLineHeight + 18; // texto + margen superior
    const signatureBlockHeight = 90;  // firmas (título, línea, nombre, cargo)
    const footerBlockHeight = 80;     // footer institucional

    // Punto base donde intentaríamos pintar el texto
    let baseY = afterTableY + 18;

    // ¿Cabe todo debajo de la tabla en esta página?
    if (baseY + textBlockHeight + signatureBlockHeight + footerBlockHeight > pageHeight) {
      // No cabe: pasamos TODO el bloque a una nueva página
      doc.addPage();
      baseY = 80; // margen superior en la nueva página
    }

    // --- Texto de responsabilidad ---
    doc.text(split, left, baseY);

    // --- Firmas ---
    const firmasTop = baseY + textBlockHeight + 30;

    const colWidth = (pageWidth - left * 2) / 2;
    const colCenterLeft  = left + colWidth / 2;
    const colCenterRight = left + colWidth + colWidth / 2;
    const gapBeforeLine = 45;
    const lineHalf = (colWidth - 60) / 2;

    // RECIBIDO POR (Solicitante)
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBIDO POR:', colCenterLeft, firmasTop - 6, { align: 'center' });

    const recibidoLineY = firmasTop + gapBeforeLine;
    doc.line(colCenterLeft - lineHalf, recibidoLineY, colCenterLeft + lineHalf, recibidoLineY);
    doc.text(data.recibidoNombre, colCenterLeft, recibidoLineY + 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.text(data.recibidoCargo || '', colCenterLeft, recibidoLineY + 28, { align: 'center' });

    // ENTREGADO POR
    doc.setFont('helvetica', 'bold');
    doc.text('ENTREGADO POR:', colCenterRight, firmasTop - 6, { align: 'center' });

    const entregadoLineY = firmasTop + gapBeforeLine;
    doc.line(colCenterRight - lineHalf, entregadoLineY, colCenterRight + lineHalf, entregadoLineY);

    // Nombre (negrita)
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.entregadoNombre || ''), colCenterRight, entregadoLineY + 14, { align: 'center' });

    // Cargo (normal)
    doc.setFont('helvetica', 'normal');
    doc.text(String(data.entregadoCargo || ''), colCenterRight, entregadoLineY + 28, { align: 'center' });

    // --- Footer institucional ---
    // Lo pintamos debajo de las firmas, pero nunca pegado al borde inferior
    const footerStartY = Math.min(
      entregadoLineY + 80,
      pageHeight - 100
    );
    this.drawFooterBlock(doc, opt, footerStartY);

    (doc as any).setProperties({ title: `${data.numeroActa}`, author: opt.author || 'Sistema' });
    doc.save(`${data.numeroActa}.pdf`);  // doc.save(`Acta_${data.numeroActa}.pdf`);
  }

  /** Dibuja el bloque institucional centrado SIEMPRE en el pie de página */
    private drawFooterBlock(doc: jsPDF, opt: DeliveryExportOptions, startY: number) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // El footer ahora empieza donde le digamos
    let y = startY;

    const websiteText   = opt.websiteText   ?? 'www.fame.ec';
    const matrizTitle   = opt.matrizTitle   ?? 'PUNTO DE VENTA MATRIZ';
    const matrizAddress = opt.matrizAddress ?? 'Dirección: Av. General Rumiñahui, Sangolquí 171103. (Junto a la ESPE)';
    const puntoQuito    = opt.puntoQuito    ?? 'PUNTO DE VENTA QUITO';
    const puntoGye      = opt.puntoGuayaquil?? 'PUNTO DE VENTA GUAYAQUIL';

    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text(websiteText, centerX, y, { align: 'center' }); y += 16;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text(matrizTitle, centerX, y, { align: 'center' }); y += 14;

    const dirBold = 'Dirección:';
    const dirRest = ' ' + matrizAddress.replace(/^Dirección:\s*/i, '');
    doc.setFont('helvetica', 'bold');
    const dirBoldW = doc.getTextWidth(dirBold);
    const dirFullW = dirBoldW + doc.getTextWidth(dirRest);
    const dirX = centerX - dirFullW / 2;
    doc.text(dirBold, dirX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dirRest, dirX + dirBoldW, y);
    y += 22;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    const barW = 12, barH = 22;
    const leftText = `${puntoQuito}   `;
    const rightText = `   ${puntoGye}`;
    const leftW = doc.getTextWidth(leftText);
    const rightW = doc.getTextWidth(rightText);
    const barsW = barW * 3 + 6 * 2;
    const totalW = leftW + barsW + rightW;

    let baseX = centerX - totalW / 2;
    const baseY = y;

    doc.text(leftText, baseX, baseY); baseX += leftW;
    doc.setFillColor(38,45,52);
    doc.rect(baseX,                baseY - barH + 5, barW, barH, 'F');
    doc.rect(baseX + barW + 6,     baseY - barH + 5, barW, barH, 'F');
    doc.rect(baseX + (barW + 6)*2, baseY - barH + 5, barW, barH, 'F');
    baseX += barsW;
    doc.text(rightText, baseX, baseY);
  }



  // ----------------- Excel (ExcelJS) -----------------
  private async exportExcel(
    data: ReturnType<DeliveryReportService['normalizeReport']>,
    opt: DeliveryExportOptions,
    logoBase64?: string
  ): Promise<void> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Acta', { properties: { defaultColWidth: 12 } });

    ws.columns = [
      { width: 6 },
      { width: 18 },
      { width: 42 },
      { width: 14 },
      { width: 14 },
    ];

    if (logoBase64) {
      const imgId = wb.addImage({ base64: logoBase64, extension: 'png' });
      ws.addImage(imgId, 'A1:C4');
    }

    ws.addRow([]);

    const titleRow = ws.addRow(['ACTA DE ENTREGA DE SUMINISTROS']);
    ws.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
    ws.getCell(`A${titleRow.number}`).alignment = { horizontal: 'center' };
    ws.getCell(`A${titleRow.number}`).font = { bold: true, size: 16 };

    ws.addRow([]);

    ws.addRow(['Fecha:', this.formatDate(data.fecha)]);
    ws.addRow(['Nº de Acta:', data.numeroActa]);
    ws.addRow(['Solicitante:', data.solicitante]);
    ws.addRow(['Área:', data.area]);
    ws.addRow([]);

    const header = ws.addRow(['N°', 'SKU', 'Producto', 'Unidad', 'Cantidad']);
    header.font = { bold: true, color: { argb: 'FF000000' } };
    header.alignment = { horizontal: 'center' };
    header.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    data.items.forEach(it => {
      const row = ws.addRow([it.index, it.sku || '', it.name, it.unit, it.qty]);
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'right' };
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    ws.addRow([]);
    ws.addRow([
      'Los artículos descritos en la presente acta han sido entregados en conformidad para uso exclusivo en las actividades de la empresa, ' +
      'siendo responsabilidad del solicitante su uso y custodia.'
    ]);
    ws.mergeCells(`A${ws.lastRow!.number}:E${ws.lastRow!.number}`);

    ws.addRow([]);
    const firmas = ws.addRow(['RECIBIDO POR:', '', '', 'ENTREGADO POR:']);
    firmas.font = { bold: true };
    ws.addRow([data.recibidoNombre, '', '', data.entregadoNombre]);
    ws.addRow([data.recibidoCargo || '', '', '', data.entregadoCargo || '']);

    ws.addRow([]);
    // Bloque institucional al final
    ws.addRow([opt.websiteText ?? 'www.fame.ec']).font = { bold: true, size: 14 };
    ws.addRow([opt.matrizTitle ?? 'PUNTO DE VENTA MATRIZ']).font = { bold: true, size: 10 };
    ws.addRow([opt.matrizAddress ?? 'Dirección: Av. General Rumiñahui, Sangolquí 171103. (Junto a la ESPE)']).font = { size: 10 };
    ws.addRow([`${opt.puntoQuito ?? 'PUNTO DE VENTA QUITO'}   ▮ ▮ ▮   ${opt.puntoGuayaquil ?? 'PUNTO DE VENTA GUAYAQUIL'}`]).font = { bold: true, size: 10 };

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Acta_${data.numeroActa}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // ----------------- Helpers -----------------

  /** Rellena con ceros a la izquierda hasta 11 dígitos si es numérico.
   *  Si no es numérico puro, se devuelve tal cual. */
  private pad11(v: any): string {
    const s = String(v ?? '');
    if (!s) return '';
    if (/^\d+$/.test(s)) {
      return s.padStart(11, '0'); // siempre 11 dígitos
    }
    return s;
  }

  private formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  }
}
