import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';

import { Report, ReportType, ReportStatus } from '../../entities/report.entity';
import { Product } from '../../entities/product.entity';
import { ProductReport } from '../../entities/productReport.entity';
import { User } from '../../entities/user.entity';
import { CreateReportDto } from '../../dtos/create-report.dto';

type CreateReportInput = CreateReportDto & {
  userId?: number;         // responsable (INCOME)
  requestedById?: number;  // solicitante (OUTCOME)
};

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    @InjectRepository(ProductReport) private productReportRepository: Repository<ProductReport>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createReport(input: CreateReportInput) {
    const { userId, requestedById, type, description } = input as any;

    // Normalización defensiva: aceptar 'items' o 'products'
    const rawItems = Array.isArray((input as any).items)
      ? (input as any).items
      : Array.isArray((input as any).products)
        ? (input as any).products
        : [];

    const items: Array<{ productId: number; quantity: number }> = rawItems.map((it: any) => ({
      productId: Number(it?.productId),
      quantity: Number(it?.quantity),
    }));

    // Validaciones básicas
    if (!type || !Object.values(ReportType).includes(type)) {
      throw new BadRequestException('Tipo de reporte inválido');
    }
    if (items.length === 0) {
      throw new BadRequestException('El reporte debe incluir al menos un producto');
    }
    for (const it of items) {
      if (!Number.isInteger(it.productId) || it.productId <= 0) {
        throw new BadRequestException('productId inválido en los ítems');
      }
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
        throw new BadRequestException('quantity inválida en los ítems');
      }
    }

    // Usuarios (responsable / solicitante) según el tipo
    let user: User | null = null;         // responsable/aprobador
    let requestedBy: User | null = null;  // solicitante

    if (type === ReportType.INCOME) {
      // INCOME: requiere responsable desde userId (token / body)
      if (!userId) {
        throw new BadRequestException('userId es obligatorio para reportes de ingreso');
      }
      user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('Usuario responsable no encontrado');
    } else if (type === ReportType.OUTCOME) {
      // OUTCOME: requiere solicitante desde requestedById (token)
      if (!requestedById) {
        throw new BadRequestException('requestedById es obligatorio para reportes de salida');
      }
      requestedBy = await this.userRepository.findOne({ where: { id: requestedById } });
      if (!requestedBy) throw new NotFoundException('Usuario solicitante no encontrado');
    }

    // Verificar productos existentes
    const productIds = Array.from(new Set(items.map(i => i.productId)));
    const products = await this.productRepository.find({ where: { id: In(productIds) } });
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map(p => p.id));
      const missing = productIds.filter(id => !foundIds.has(id));
      throw new BadRequestException(`Productos no encontrados: [${missing.join(', ')}]`);
    }

    // Para INCOME agrupamos cantidades por producto (evita múltiples saves por producto)
    const totals = new Map<number, number>();
    for (const it of items) {
      totals.set(it.productId, (totals.get(it.productId) ?? 0) + it.quantity);
    }

    return await this.dataSource.transaction(async (manager) => {
      const reportRepo = manager.getRepository(Report);
      const prRepo = manager.getRepository(ProductReport);
      const prodRepo = manager.getRepository(Product);

      // 1) Crear cabecera del reporte
      const report = reportRepo.create({
        type,
        description: description ?? null,
        status: ReportStatus.PENDING,
        user: user ?? null,                 // INCOME: responsable; OUTCOME: null
        requestedBy: requestedBy ?? null,   // OUTCOME: solicitante; INCOME: null
      } as Partial<Report>);
      const savedReport = await reportRepo.save(report);

      // 2) Crear líneas
      const pmap = new Map(products.map(p => [p.id, p]));
      const lines = items.map((it) =>
        prRepo.create({
          report: savedReport,
          product: pmap.get(it.productId)!,
          quantity: it.quantity,
        } as Partial<ProductReport>)
      );
      await prRepo.save(lines);

      // 3) Si es INCOME: bloquear productos y aumentar stock; marcar APPROVED
      if (type === ReportType.INCOME) {
        const locked = await prodRepo
          .createQueryBuilder('p')
          .where('p.id IN (:...ids)', { ids: Array.from(totals.keys()) })
          .setLock('pessimistic_write')
          .getMany();

        const lockMap = new Map<number, Product>(locked.map(p => [p.id, p]));

        for (const [pid, qty] of totals.entries()) {
          const p = lockMap.get(pid);
          if (!p) throw new BadRequestException(`Producto ${pid} no encontrado para ingreso`);
          (p as any).stock = Number((p as any).stock ?? 0) + qty;
          await prodRepo.save(p);
        }

        savedReport.status = ReportStatus.APPROVED;
        await reportRepo.save(savedReport);
      }

      // 4) Devolver con relaciones
      return reportRepo.findOne({
        where: { id: savedReport.id },
        relations: ['user', 'ProductReports', 'ProductReports.product'],
      });
    });
  }

  async findAllReports() {
    return this.reportRepository.find({
      relations: ['user', 'ProductReports', 'ProductReports.product'],
      order: { createdAt: 'DESC' as const },
    });
  }

  async findReportById(id: number) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'ProductReports', 'ProductReports.product'],
    });
    if (!report) throw new NotFoundException('Reporte no encontrado');
    return report;
  }

  /**
   * Elimina un reporte solo si está PENDING (borra líneas y cabecera en transacción).
   */
  async deleteReport(id: number) {
    return await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Report);
      const report = await repo.findOne({
        where: { id },
        relations: ['ProductReports'],
      });
      if (!report) throw new NotFoundException('Reporte no encontrado');
      if (report.status !== ReportStatus.PENDING) {
        throw new ConflictException('Solo se puede eliminar un reporte PENDING');
      }

      const prRepo = manager.getRepository(ProductReport);
      if ((report as any).ProductReports?.length) {
        await prRepo.remove((report as any).ProductReports);
      }
      await repo.remove(report);
      return { id, deleted: true };
    });
  }

  /**
   * Aprueba un OUTCOME: valida stock, descuenta y asigna el aprobador como `user`.
   */
  async approveReport(id: number, approverUserId: number) {
    if (!Number.isInteger(approverUserId) || approverUserId <= 0) {
      throw new BadRequestException('Usuario aprobador inválido');
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      // Cargar usuario aprobador dentro de la transacción
      const approver = await runner.manager
        .getRepository(User)
        .findOne({ where: { id: approverUserId } });

      if (!approver) {
        throw new NotFoundException('Usuario aprobador no encontrado');
      }

      // 1) Lock SOLO la fila del reporte
      const report = await runner.manager
        .getRepository(Report)
        .createQueryBuilder('r')
        .where('r.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();

      if (!report) throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
      if (report.status !== ReportStatus.PENDING)
        throw new ConflictException(`El reporte ya fue procesado`);
      if (report.type !== ReportType.OUTCOME)
        throw new BadRequestException(`Solo se pueden aprobar reportes de salida`);

      // 2) Cargar líneas + productos (sin lock)
      const lines = await runner.manager.getRepository(ProductReport).find({
        where: { report: { id } as any },
        relations: ['product'],
      });

      if (lines.length === 0) {
        // Nada que descontar; marcar aprobado para cerrar el ciclo
        report.status = ReportStatus.APPROVED;
        report.user = approver as any; // asignar aprobador
        const saved = await runner.manager.getRepository(Report).save(report);
        await runner.commitTransaction();
        return saved;
      }

      // 3) Lock de productos afectados
      const productIds = Array.from(new Set(lines.map(l => (l as any).product?.id).filter(Boolean)));
      if (productIds.length === 0) {
        throw new BadRequestException('El reporte no tiene productos válidos');
      }

      const lockedProducts = await runner.manager
        .getRepository(Product)
        .createQueryBuilder('p')
        .where('p.id IN (:...ids)', { ids: productIds })
        .setLock('pessimistic_write')
        .getMany();

      const pmap = new Map<number, Product>(lockedProducts.map(p => [p.id, p]));

      // 4) Validar stock con filas bloqueadas
      for (const pr of lines) {
        const prod = pmap.get((pr as any).product.id);
        if (!prod) {
          throw new BadRequestException(
            `Producto ${(pr as any).product?.name || (pr as any).product?.id} no encontrado`
          );
        }
        if ((prod as any).stock < (pr as any).quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${(prod as any).name}: requiere ${(pr as any).quantity}, disponible ${(prod as any).stock}`
          );
        }
      }

      // 5) Descontar stock y guardar
      for (const pr of lines) {
        const prod = pmap.get((pr as any).product.id)!;
        (prod as any).stock = Number((prod as any).stock ?? 0) - Number((pr as any).quantity ?? 0);
        await runner.manager.getRepository(Product).save(prod);
      }

      // 6) Marcar aprobado y asignar aprobador como user
      report.status = ReportStatus.APPROVED;
      report.user = approver as any;
      const saved = await runner.manager.getRepository(Report).save(report);

      await runner.commitTransaction();
      return saved;
    } catch (e) {
      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }

  /**
   * Rechaza un reporte PENDING (no toca stock).
   */
  async rejectReport(id: number) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const report = await runner.manager
        .getRepository(Report)
        .createQueryBuilder('r')
        .where('r.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();

      if (!report) throw new NotFoundException('Reporte no encontrado');
      if (report.status !== ReportStatus.PENDING)
        throw new ConflictException('El reporte ya fue procesado');

      report.status = ReportStatus.REJECTED;
      const saved = await runner.manager.getRepository(Report).save(report);

      await runner.commitTransaction();
      return saved;
    } catch (e) {
      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }
}
