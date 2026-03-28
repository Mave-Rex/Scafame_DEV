// src/inventory/controllers/unit.controller.ts
import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { UnitService } from '../services/unit.service';

@Controller('units') 
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  /** Crear unidad */
  @Post()
  create(@Body() body: { name: string; description?: string; abbreviation?: string }) {
    return this.unitService.createUnit(body);
  }

  /** Listar unidades */
  @Get()
  findAll() {
    return this.unitService.findAllUnits();
  }

  /** Obtener por id */
  @Get(':id')
  findById(@Param('id') id: number) {
    return this.unitService.findUnitById(Number(id));
  }

  /** Editar unidad */
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() body: { name?: string; description?: string; abbreviation?: string }
  ) {
    return this.unitService.updateUnit(Number(id), body);
  }

  /** Eliminar unidad */
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.unitService.deleteUnit(Number(id));
  }
}
