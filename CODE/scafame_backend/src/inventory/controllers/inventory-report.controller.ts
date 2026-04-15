import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { InventoryReportService } from '../services/inventory-report.service';

@Controller('reports')
export class InventoryReportController {
  constructor(private readonly reportsService: InventoryReportService) {}

  // ✅ Ruta segura (no choca con :id)
  @Get('inventory/excel')
  async downloadInventory(
    @Query('q') q: string | undefined,
    @Query('categoryId') categoryId: string | undefined,
    @Query('categoryName') categoryName: string | undefined,
    @Query('unitName') unitName: string | undefined,
    @Res() res: Response,
  ) {
    const parsedCategoryId =
      categoryId !== undefined && categoryId !== '' ? Number(categoryId) : undefined;

    if (parsedCategoryId !== undefined && Number.isNaN(parsedCategoryId)) {
      throw new BadRequestException('categoryId debe ser numerico.');
    }

    const buffer = await this.reportsService.buildInventoryExcelBuffer({
      q: q?.trim() || undefined,
      categoryId: parsedCategoryId,
      categoryName: categoryName?.trim() || undefined,
      unitName: unitName?.trim() || undefined,
    });
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

