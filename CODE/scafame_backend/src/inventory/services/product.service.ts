import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/productCategory.entity';
import { Unit } from '../../entities/unit.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,

    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async createProduct(data: {
    name: string;
    productCategoryId: number;
    minimumStock: number;
    description?: string;
    imageUrl?: string | null;
    unitId?: number; // NUEVO
  }) {
    const category = await this.categoryRepository.findOne({ where: { id: data.productCategoryId } });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${data.productCategoryId} no encontrada`);
    }

    let unit: Unit | null = null;
    if (data.unitId != null) {
      unit = await this.unitRepository.findOne({ where: { id: data.unitId } });
      if (!unit) {
        throw new NotFoundException(`Unidad con ID ${data.unitId} no encontrada`);
      }
    }

    const product = this.productRepository.create({
      name: data.name,
      productCategory: category,
      minimumStock: data.minimumStock,
      stock: 0,
      description: data.description,
      ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}), // FIX del “.(...)”
      unit, // NUEVO
    });

    return await this.productRepository.save(product);
  }

  async findAllProducts() {
    return await this.productRepository.find(); // unit llega por eager=true
  }

  async findProductById(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return product;
  }

  async updateProduct(
    id: number,
    data: {
      name?: string;
      productCategoryId?: number;
      minimumStock?: number;
      description?: string;
      imageUrl?: string;
      unitId?: number | null; // NUEVO
    },
  ) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    if (data.name !== undefined) product.name = data.name;
    if (data.minimumStock !== undefined) product.minimumStock = data.minimumStock;
    if (data.description !== undefined) product.description = data.description;
    if (data.imageUrl !== undefined) product.imageUrl = data.imageUrl;

    if (data.productCategoryId !== undefined) {
      const category = await this.categoryRepository.findOne({ where: { id: data.productCategoryId } });
      if (!category) throw new NotFoundException(`Categoría con ID ${data.productCategoryId} no encontrada`);
      product.productCategory = category;
    }

    // NUEVO: actualizar unidad (permitimos null para quitarla)
    if (data.unitId !== undefined) {
      if (data.unitId === null) {
        product.unit = null;
      } else {
        const unit = await this.unitRepository.findOne({ where: { id: data.unitId } });
        if (!unit) throw new NotFoundException(`Unidad con ID ${data.unitId} no encontrada`);
        product.unit = unit;
      }
    }

    return await this.productRepository.save(product);
  }

  async deleteProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    await this.productRepository.remove(product);
    return { message: 'Producto eliminado' };
  }
}
