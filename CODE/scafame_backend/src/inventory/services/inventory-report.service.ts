import { Injectable } from '@nestjs/common';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../services/product.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class InventoryReportService {
  constructor(private readonly productService: ProductService) {}

  async buildInventoryExcelBuffer(): Promise<Buffer> {
    const products = await this.productService.findAllProducts(); // ya lo tienes

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

  
}
