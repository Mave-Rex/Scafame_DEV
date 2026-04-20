import { Injectable } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import * as ExcelJS from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReport } from '../../entities/productReport.entity';
import { ReportStatus, ReportType } from '../../entities/report.entity';
import { BadRequestException } from '@nestjs/common';

type InventoryExcelFilters = {
  q?: string;
  categoryId?: number;
  categoryName?: string;
  unitName?: string;
};

@Injectable()
export class InventoryReportService {
  constructor(
    private readonly productService: ProductService,
    @InjectRepository(ProductReport)
    private readonly productReportRepository: Repository<ProductReport>,
  ) {}

  async buildInventoryExcelBuffer(filters?: InventoryExcelFilters): Promise<Buffer> {
    const baseProducts = await this.productService.findAllProducts({
      q: filters?.q,
      categoryId: filters?.categoryId,
      categoryName: filters?.categoryName,
    });

    const normalizedUnit = filters?.unitName?.trim().toLowerCase();
    const products = normalizedUnit
      ? baseProducts.filter((p) => (p.unit?.name ?? '').trim().toLowerCase() === normalizedUnit)
      : baseProducts;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Inventario');

    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'name', width: 28 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Stock mínimo', key: 'minimumStock', width: 14 },
      { header: 'Categoría', key: 'category', width: 22 },
      { header: 'Unidad', key: 'unit', width: 14 },
      { header: 'Fecha creación', key: 'creationDate', width: 18 },
    ];

    ws.getRow(1).font = { bold: true };

    for (const p of products) {
      ws.addRow({
        id: p.id,
        name: p.name,
        stock: p.stock,
        minimumStock: p.minimumStock,
        category: p.productCategory?.name ?? '',
        unit: p.unit?.name ?? '',
        creationDate: p.creationDate ? new Date(p.creationDate).toISOString().slice(0, 10) : '',
      });
    }

    // Opcional: filtros y congelar header
    ws.autoFilter = 'A1:G1';
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  async buildTopConsumedByAreaExcelBuffer(filters?: { area?: string; startDate?: string; endDate?: string }): Promise<Buffer> {
    const normalizedArea = filters?.area?.trim().toLowerCase();
    const startDate = filters?.startDate ? new Date(filters.startDate) : null;
    const endDate = filters?.endDate ? new Date(filters.endDate) : null;

    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('startDate invalida');
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('endDate invalida');
    }

    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException('startDate no puede ser mayor que endDate');
    }

    const rows = await this.productReportRepository.find({
      relations: ['report', 'report.requestedBy', 'product'],
    });

    const consumptionRows = rows.filter((row) => {
      const report: any = row.report;
      if (!report) return false;
      if (report.type !== ReportType.OUTCOME) return false;
      if (report.status !== ReportStatus.APPROVED) return false;

      const createdAt = report.createdAt ? new Date(report.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return false;

      if (startDate) {
        const from = new Date(startDate);
        from.setHours(0, 0, 0, 0);
        if (createdAt.getTime() < from.getTime()) return false;
      }

      if (endDate) {
        const to = new Date(endDate);
        to.setHours(23, 59, 59, 999);
        if (createdAt.getTime() > to.getTime()) return false;
      }

      const area = (report.requestedBy?.area ?? '').trim().toLowerCase();
      if (!area) return false;
      if (normalizedArea && area !== normalizedArea) return false;

      return true;
    });

    const data = consumptionRows
      .map((row) => ({
        area: row.report.requestedBy?.area?.trim() ?? 'Sin area',
        solicitante:
          `${row.report.requestedBy?.firstname || ''} ${row.report.requestedBy?.lastname || ''}`.trim() ||
          row.report.requestedBy?.username ||
          'No identificado',
        createdAt: row.report?.createdAt ? new Date(row.report.createdAt) : null,
        fecha: row.report?.createdAt ? new Date(row.report.createdAt).toLocaleDateString('es-EC') : '',
        product: row.product?.name?.trim() ?? 'Producto desconocido',
        total: Number(row.quantity ?? 0),
      }))
      .filter((item) => item.createdAt && Number.isFinite(item.total) && item.total > 0)
      .sort((a, b) => {
        const dateCmp = (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
        if (dateCmp !== 0) return dateCmp;
        const areaCmp = a.area.localeCompare(b.area, 'es', { sensitivity: 'base' });
        if (areaCmp !== 0) return areaCmp;
        return b.total - a.total;
      });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Consumo por area');

    ws.columns = [
      { header: 'Area', key: 'area', width: 26 },
      { header: 'Solicitante', key: 'solicitante', width: 28 },
      { header: 'Fecha', key: 'fecha', width: 16 },
      { header: 'Producto', key: 'product', width: 34 },
      { header: 'Cantidad consumida', key: 'total', width: 20 },
    ];

    ws.getRow(1).font = { bold: true };

    for (const item of data) {
      ws.addRow({
        area: item.area,
        solicitante: item.solicitante,
        fecha: item.fecha,
        product: item.product,
        total: item.total,
      });
    }

    ws.autoFilter = 'A1:E1';
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  
}
