import {
  Controller, Post, Body, Get, Param, Delete, UseGuards, Request,
  Patch, ParseIntPipe, BadRequestException, Query,
} from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../../dtos/create-report.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { ReportType, ReportStatus } from '../../entities/report.entity';

@Controller('reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateReportDto) {
    const requester = req?.user ?? {};
    const role = String(requester?.role ?? '').toLowerCase();

    // 1) Normalizar items/products
    const items =
      Array.isArray((dto as any).products) ? (dto as any).products :
      Array.isArray((dto as any).items)    ? (dto as any).items    :
      [];

    // 2) Resolver userId del token o del body (si admin/manager)
    const toInt = (v: unknown): number => {
      const n = Number(v);
      return Number.isInteger(n) && n > 0 ? n : NaN;
    };

    const tokenIdCandidates = [
      requester.userId,
      requester.id,
      requester.sub,
    ];

    let tokenUserId = NaN;
    for (const c of tokenIdCandidates) {
      tokenUserId = toInt(c);
      if (Number.isInteger(tokenUserId)) break;
    }

    if (!Number.isInteger(tokenUserId)) {
      const username = requester.username ?? requester.preferred_username ?? null;
      const email = requester.email ?? null;

      if (username || email) {
        const user = await this.userRepo.findOne({
          where: username ? { username } : { email },
        });
        if (user) {
          tokenUserId = user.id;
        }
      }
    }

    if (!Number.isInteger(tokenUserId)) {
      throw new BadRequestException('Invalid user id (from token or body).');
    }

    // Permitir que admin/manager cambien el responsable SOLO para INCOME
    let effectiveUserId = tokenUserId;
    const bodyUserId = toInt((dto as any).userId);
    if (bodyUserId && (role === 'admin' || role === 'manager')) {
      effectiveUserId = bodyUserId;
    }

    const type = (dto as any).type;

    // 3) Payload hacia el service
    const payload: any = {
      type,                                   // 'income' | 'outcome'
      description: (dto as any).description ?? null,
      items,                                  // [{productId, quantity}]
    };

    // INCOME: se envía userId (responsable) como antes
    if (type === ReportType.INCOME || type === 'income') {
      payload.userId = effectiveUserId;
    }

    // OUTCOME: NO se envía userId, solo requestedById con el usuario del token
    if (type === ReportType.OUTCOME || type === 'outcome') {
      payload.requestedById = tokenUserId;
    }

    return this.reportService.createReport(payload as any);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const normalizedType = type?.toLowerCase();
    const normalizedStatus = status?.toLowerCase();

    if (normalizedType && !Object.values(ReportType).includes(normalizedType as ReportType)) {
      throw new BadRequestException('Invalid report type.');
    }

    if (normalizedStatus && !Object.values(ReportStatus).includes(normalizedStatus as ReportStatus)) {
      throw new BadRequestException('Invalid report status.');
    }

    return this.reportService.findAllReports({
      type: normalizedType as ReportType | undefined,
      status: normalizedStatus as ReportStatus | undefined,
    });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.findReportById(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.deleteReport(id);
  }

  // Aprueba OUTCOME y asigna el usuario aprobador al campo `user`
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  async approve(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const requester = req?.user ?? {};

    const toInt = (v: unknown): number => {
      const n = Number(v);
      return Number.isInteger(n) && n > 0 ? n : NaN;
    };

    const tokenIdCandidates = [
      requester.userId,
      requester.id,
      requester.sub,
    ];

    let tokenUserId = NaN;
    for (const c of tokenIdCandidates) {
      tokenUserId = toInt(c);
      if (Number.isInteger(tokenUserId)) break;
    }

    if (!Number.isInteger(tokenUserId)) {
      const username = requester.username ?? requester.preferred_username ?? null;
      const email = requester.email ?? null;

      if (username || email) {
        const user = await this.userRepo.findOne({
          where: username ? { username } : { email },
        });
        if (user) {
          tokenUserId = user.id;
        }
      }
    }

    if (!Number.isInteger(tokenUserId)) {
      throw new BadRequestException('Invalid user id (from token).');
    }

    return this.reportService.approveReport(id, tokenUserId);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.rejectReport(id);
  }
}
