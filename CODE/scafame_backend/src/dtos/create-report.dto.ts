// src/dtos/create-report.dto.ts
import {
  IsEnum, IsInt, IsArray, ValidateNested, Min, IsOptional, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '../entities/report.entity'; // ajusta la ruta si cambia

class ReportProductDto {
  @Type(() => Number)
  @IsInt()
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateReportDto {
  // ✅ Usa el enum real del dominio
  @IsEnum(ReportType)
  type: ReportType;

  // 🆕 Usuario que SOLICITA el pedido 
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  requestedById: number;

  // (YA EXISTENTE) Usuario que ENTREGA (opcional si se asigna después)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number; // entrega (deliverer)

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReportProductDto)
  products: ReportProductDto[];
}
