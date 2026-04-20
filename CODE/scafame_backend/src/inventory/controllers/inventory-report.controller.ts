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

  @Get('outcomes/top-products/excel')
  async downloadTopProductsByArea(
    @Query('area') area: string | undefined,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.buildTopConsumedByAreaExcelBuffer({
      area: area?.trim() || undefined,
      startDate: startDate?.trim() || undefined,
      endDate: endDate?.trim() || undefined,
    });
    const areaLabel = this.safeFilePart(area?.trim() || 'Todos');
    const rangeLabel = this.buildRangeLabel(startDate?.trim() || undefined, endDate?.trim() || undefined);
    const filename = rangeLabel
      ? `ReporteArea_${areaLabel}_${rangeLabel}_${this.localDateCompactYYYYMMDD()}.xlsx`
      : `ReporteArea_${areaLabel}_${this.localDateCompactYYYYMMDD()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(buffer);
  }

  private localDateCompactYYYYMMDD(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }

  private localDateYYYYMMDD(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${m}-${y}`;
  }

  private safeFilePart(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'Todos';
  }

  private buildRangeLabel(startDate?: string, endDate?: string): string {
    if (!startDate && !endDate) return '';

    const start = startDate ? this.safeFilePart(startDate) : 'inicio';
    const end = endDate ? this.safeFilePart(endDate) : 'fin';

    if (startDate && endDate) {
      return `${start}_al_${end}`;
    }

    if (startDate) {
      return `desde_${start}`;
    }

    return `hasta_${end}`;
  }

}

