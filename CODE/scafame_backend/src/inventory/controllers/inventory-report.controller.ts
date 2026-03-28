import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { InventoryReportService } from '../services/inventory-report.service';

@Controller('reports')
export class InventoryReportController {
  constructor(private readonly reportsService: InventoryReportService) {}

  // ✅ Ruta segura (no choca con :id)
  @Get('inventory/excel')
  async downloadInventory(@Res() res: Response) {
    const buffer = await this.reportsService.buildInventoryExcelBuffer();
    const filename = `ReporteInventario_${this.localDateYYYYMMDD()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(buffer);
  }

  private localDateYYYYMMDD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${m}-${y}`;
}

}

