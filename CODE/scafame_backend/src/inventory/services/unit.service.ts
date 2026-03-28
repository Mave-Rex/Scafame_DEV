import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../../entities/unit.entity';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  /** Crear Unidad */
  async createUnit(data: { name: string; description?: string; abbreviation?: string }) {
    const newUnit = this.unitRepository.create({
      name: data.name,
      description: data.description,
      abbreviation: data.abbreviation,
    });
    return await this.unitRepository.save(newUnit);
  }

  /** Obtener Todas */
  async findAllUnits() {
    return await this.unitRepository.find();
  }

  /** Obtener por ID */
  async findUnitById(id: number) {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
    return unit; // <- antes devolvía "Unit" (la clase) ❌
  }

  /** Editar */
  async updateUnit(id: number, data: { name?: string; description?: string; abbreviation?: string }) {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Unidad con ID ${id} no encontrada`);

    if (data.name !== undefined) unit.name = data.name;
    if (data.description !== undefined) unit.description = data.description;
    if (data.abbreviation !== undefined) unit.abbreviation = data.abbreviation;

    return await this.unitRepository.save(unit);
  }

  /** Eliminar */
  async deleteUnit(id: number) {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
    return await this.unitRepository.remove(unit);
  }
}
