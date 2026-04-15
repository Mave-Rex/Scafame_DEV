import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/productCategory.entity';
import { Unit } from '../../entities/unit.entity';

type ProductFilters = {
  q?: string;
  categoryId?: number;
  categoryName?: string;
  inStock?: boolean;
  lowStock?: boolean;
};

type ProductPagination = {
  page: number;
  limit: number;
};

export type PaginatedProductsResult = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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

  private buildFilteredProductsQuery(filters?: ProductFilters) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productCategory', 'productCategory')
      .leftJoinAndSelect('product.unit', 'unit')
      .orderBy('product.name', 'ASC');

    if (filters?.categoryId !== undefined) {
      qb.andWhere('productCategory.id = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.categoryName) {
      qb.andWhere('LOWER(productCategory.name) = :categoryName', {
        categoryName: filters.categoryName.trim().toLowerCase(),
      });
    }

    if (filters?.inStock) {
      qb.andWhere('product.stock > 0');
    }

    if (filters?.lowStock) {
      qb.andWhere('product.stock <= product.minimumStock');
    }

    if (filters?.q) {
      const qNorm = `%${this.normalizeSearchText(filters.q)}%`;
      const normalizedNameExpr = this.sqlNormalizedText('product.name');
      const normalizedDescriptionExpr = this.sqlNormalizedText("COALESCE(product.description, '')");

      qb.andWhere(
        `(
          ${normalizedNameExpr} LIKE :qNorm
          OR ${normalizedDescriptionExpr} LIKE :qNorm
        )`,
        { qNorm },
      );
    }

    return qb;
  }

  private normalizeSearchText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private sqlNormalizedText(columnExpr: string): string {
    return `LOWER(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(${columnExpr},
      'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u'),'Á','a'),'É','e'),'Í','i'),'Ó','o'),'Ú','u'),'ñ','n'),'Ñ','n')
    )`;
  }

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

  async findAllProducts(filters?: ProductFilters) {
    const qb = this.buildFilteredProductsQuery(filters);
    return await qb.getMany();
  }

  async findProductsPage(
    filters: ProductFilters | undefined,
    pagination: ProductPagination,
  ): Promise<PaginatedProductsResult> {
    const page = Math.max(1, pagination.page);
    const limit = Math.max(1, Math.min(100, pagination.limit));
    const skip = (page - 1) * limit;

    const qb = this.buildFilteredProductsQuery(filters);
    // Construir query para contar el total CON filtros aplicados
    const countQb = this.buildFilteredProductsQuery(filters);
    const total = await countQb.getCount();

    // Construir query para obtener items con paginación
    const items = await qb.skip(skip).take(limit).getMany();
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
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
      imageUrl?: string | null;
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
