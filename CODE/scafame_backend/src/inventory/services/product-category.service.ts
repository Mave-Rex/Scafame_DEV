import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from '../../entities/productCategory.entity';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async createCategory(data: { name: string; description?: string }) {
    const category = this.categoryRepository.create({
      name: data.name,
      description: data.description,
    });
    return await this.categoryRepository.save(category);
  }

  async findAllCategories() {
    return await this.categoryRepository.find();
  }

  async findCategoryById(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    return category;
  }

  async updateCategory(id: number, data: { name?: string; description?: string }) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Categoría con ID ${id} no encontrada`);

    if (data.name !== undefined) category.name = data.name;
    if (data.description !== undefined) category.description = data.description;

    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    return await this.categoryRepository.remove(category);
  }
}
