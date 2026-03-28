// src/app/shared/reporting/export.service.ts
import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';

/** Tipos simples para no depender de otros módulos */
export type ReportFormat = 'excel' | 'pdf';

export interface HistoryUser {
  id: number;
  firstname?: string;
  lastname?: string;
  area?: string;
}

export interface HistoryRecord {
  id: number;
  type?: string;    // 'income'|'outcome'
  status?: string;  // 'approved'|'rejected'|'pending'
  createdAt?: string | Date;
  user?: HistoryUser | null;
}

export interface ExportOptions {
  format: ReportFormat;
  author?: string;           // nombre visible en reporte
  role?: string;             // 'admin' | 'user' | etc
  logoPath?: string;         // default '/fame_logo.png'
}

@Injectable({ providedIn: 'root' })
export class ExportService {

  /** Punto de entrada público */
  async exportHistory(records: HistoryRecord[], opts: ExportOptions): Promise<void> {
    const data = [...(records || [])]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const role = (opts.role || 'user').toLowerCase();
    const author = (opts.author || 'Usuario').trim() || 'Usuario';
    const logoPath = opts.logoPath || '/fame_logo.png';

    const summary = this.buildSummary(data);

    if (opts.format === 'excel') {
      await this.exportExcel(data, summary, author, role);
    } else {
      await this.exportPdf(data, summary, author, role, logoPath);
    }
  }

  // ----------------- Helpers comunes -----------------
  private buildSummary(data: HistoryRecord[]) {
    const countIncome = data.filter(r => (r.type || '').toLowerCase() === 'income').length;
    const countOutcome = data.length - countIncome;
    const approved = data.filter(r =>
      (r.status || '').toLowerCase() === 'approved' || (r.type || '').toLowerCase() === 'income'
    ).length;
    const rejected = data.filter(r => (r.status || '').toLowerCase() === 'rejected').length;

    const dates = data.map(r => r.createdAt).filter(Boolean) as (string | Date)[];
    const minDate = dates.length ? new Date(Math.min(...dates.map(d => +new Date(d)))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => +new Date(d)))) : null;

    return { countIncome, countOutcome, approved, rejected, minDate, maxDate };
  }

  private fmtRange(min: Date | null, max: Date | null) {
    const fmt = (d: Date) => d.toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });
    return (min && max) ? `${fmt(min)} - ${fmt(max)}` : 'Todos';
  }

  private statusLabel(r: HistoryRecord) {
    return (r.status || '').toLowerCase() === 'rejected' ? 'Rechazado'
         : (r.type || '').toLowerCase() === 'income' ? 'Aprobado'
         : (r.status || '').toLowerCase() === 'approved' ? 'Aprobado'
         : 'Pendiente';
  }

  private toDate(d: any) { return d ? new Date(d) : null; }

  // ----------------- Excel -----------------
  private async exportExcel(
    data: HistoryRecord[],
    s: ReturnType<ExportService['buildSummary']>,
    author: string,
    role: string
  ) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SCAFAME';
    wb.created = new Date();

    // Hoja 1: Resumen
    const ws1 = wb.addWorksheet('Resumen', { properties: { defaultRowHeight: 18 } });
    ws1.columns = [{ key: 'a', width: 28 }, { key: 'b', width: 48 }];

    ws1.mergeCells('A1:B1');
    const title = ws1.getCell('A1');
    title.value = 'Movimientos de Inventario';
    title.font = { size: 16, bold: true };
    title.alignment = { vertical: 'middle', horizontal: 'left' };

    const rowsResumen: Array<[string, string | number]> = [
      ['Generado por', `${author} (${role})`],
      ['Fecha de emisión', new Date().toLocaleString('es-EC')],
      ['Período cubierto', this.fmtRange(s.minDate, s.maxDate)],
      ['Registros exportados', data.length],
      ['', ''],
      ['Totales', ''],
      ['Ingresos', s.countIncome],
      ['Retiros', s.countOutcome],
      ['Aprobados', s.approved],
      ['Rechazados', s.rejected],
    ];
    rowsResumen.forEach((r, i) => {
      const row = ws1.addRow(r);
      if (i === 5) row.font = { bold: true }; // "Totales"
      row.getCell(1).font = { bold: true };
    });

    // Hoja 2: Movimientos (tabla)
    const ws2 = wb.addWorksheet('Movimientos', { properties: { defaultRowHeight: 18 } });
    const cols = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Tipo', key: 'tipo', width: 12 },
      { header: 'Estado', key: 'estado', width: 14 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Usuario', key: 'usuario', width: 28 },
      { header: 'Área', key: 'area', width: 16 },
    ];
    ws2.columns = cols as any;

    const rows = data.map(r => {
      const tipo = (r.type || '').toLowerCase() === 'income' ? 'Ingreso' : 'Retiro';
      const estado = this.statusLabel(r);
      const fecha = this.toDate(r.createdAt);
      const usuario = r.user ? `${r.user.firstname || ''} ${r.user.lastname || ''}`.trim() : '';
      const area = r.user?.area || '';
      return [r.id, tipo, estado, fecha, usuario, area];
    });

    ws2.addTable({
      name: 'TablaMovimientos',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium9', showRowStripes: true },
      columns: cols.map(c => ({ name: c.header, filterButton: true })),
      rows
    });

    ws2.views = [{ state: 'frozen', ySplit: 1 }];
    ws2.getColumn(4).numFmt = 'dd/mm/yyyy hh:mm';

    // Colorear estado
    const firstDataRow = 2;
    const lastRow = 1 + rows.length;
    for (let i = firstDataRow; i <= lastRow; i++) {
      const c = ws2.getCell(`C${i}`);
      const v = (c.value ?? '').toString().toLowerCase();
      if (v === 'aprobado') c.font = { color: { argb: 'FF16A34A' }, bold: true };
      if (v === 'rechazado') c.font = { color: { argb: 'FFDC2626' }, bold: true };
    }

    // Ajuste simple de ancho
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
    ws2.columns.forEach((col, idx) => {
      let maxLen = (cols[idx].width ?? 10);
      for (let i = firstDataRow; i <= lastRow; i++) {
        const val = ws2.getCell(i, idx + 1).value as any;
        const len = val instanceof Date ? 16 : (val ? val.toString().length : 0);
        maxLen = Math.max(maxLen, len + 2);
      }
      col.width = clamp(maxLen, 8, 40);
    });

    // Descargar
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = this.buildFileName(role, 'xlsx');
    this.downloadBlob(blob, fileName);
  }

  // ----------------- PDF -----------------
  private async exportPdf(
    data: HistoryRecord[],
    s: ReturnType<ExportService['buildSummary']>,
    author: string,
    role: string,
    logoPath: string
  ) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 48;
    const headerTop = 40;

    // Logo
    const logoDataUrl = await this.fetchImageAsDataURL(logoPath);
    if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', marginX, headerTop, 120, 60, undefined, 'FAST');

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Reporte de Movimientos de Inventario', marginX, headerTop + 80);

    // Metadatos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const metaTop = headerTop + 100;
    const lineH = 14;
    const meta = [
      `Generado por: ${author} (${role})`,
      `Fecha de emisión: ${new Date().toLocaleString('es-EC')}`,
      `Período cubierto: ${this.fmtRange(s.minDate, s.maxDate)}`,
      `Registros exportados: ${data.length}`
    ];
    meta.forEach((t, i) => doc.text(t, marginX, metaTop + i * lineH));

    // Chips de totales
    const chips = [
      { label: 'Ingresos', value: s.countIncome },
      { label: 'Retiros', value: s.countOutcome },
      { label: 'Aprobados', value: s.approved },
      { label: 'Rechazados', value: s.rejected },
    ];
    let x = marginX, chipsY = metaTop + lineH * meta.length + 10;
    doc.setFontSize(10);
    chips.forEach(ch => {
      const txt = `${ch.label}: ${ch.value}`;
      const w = doc.getTextWidth(txt) + 14;
      doc.setDrawColor(0);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(x, chipsY, w, 20, 6, 6, 'F');
      doc.text(txt, x + 7, chipsY + 14);
      x += w + 8;
    });

    // Tabla
    const body = data.map(r => {
      const tipo = (r.type || '').toLowerCase() === 'income' ? 'Ingreso' : 'Retiro';
      const estado = this.statusLabel(r);
      const fecha = this.toDate(r.createdAt)?.toLocaleString('es-EC') ?? '';
      const usuario = r.user ? `${r.user.firstname || ''} ${r.user.lastname || ''}`.trim() : '';
      const area = r.user?.area || '';
      return [r.id, tipo, estado, fecha, usuario, area];
    });

    autoTable(doc, {
      head: [['ID', 'Tipo', 'Estado', 'Fecha', 'Usuario', 'Área']],
      body,
      startY: chipsY + 36,
      margin: { left: marginX, right: marginX },
      styles: { fontSize: 9, cellPadding: 6, valign: 'middle' },
      headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      didParseCell: (data: CellHookData) => {
        if (data.section === 'body' && data.column.index === 2) {
          const v = (data.cell.raw ?? '').toString().toLowerCase();
          if (v === 'aprobado') data.cell.styles.textColor = [22, 163, 74];
          if (v === 'rechazado') data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      didDrawPage: () => {
        // línea bajo encabezado
        doc.setDrawColor(230);
        doc.line(marginX, headerTop + 90, doc.internal.pageSize.getWidth() - marginX, headerTop + 90);
        // pie
        const str = `Página ${doc.getCurrentPageInfo().pageNumber} de ${doc.getNumberOfPages()}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(str, doc.internal.pageSize.getWidth() - marginX, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
      }
    });

    doc.save(this.buildFileName(role, 'pdf'));
  }

  // ----------------- Utils de descarga/imagen -----------------
  private buildFileName(role: string, ext: string) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `movimientos_${role}_${yyyy}-${mm}-${dd}.${ext}`;
  }

  private downloadBlob(blob: Blob, fileName: string) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private async fetchImageAsDataURL(path: string): Promise<string | null> {
    try {
      const res = await fetch(path);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }
}
