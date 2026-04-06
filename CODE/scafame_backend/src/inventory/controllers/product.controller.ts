import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';

// ---- Configuración de subida de imágenes ----
const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  },
});

function imageFileFilter(_req: any, file: Express.Multer.File, cb: Function) {
  // Permite png, jpg, jpeg, webp
  if (!/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
    return cb(new BadRequestException('Solo se permiten imágenes (png, jpg, jpeg, webp).'), false);
  }
  cb(null, true);
}

const uploadOptions = {
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ---------- CREATE (con imagen opcional) ----------
  @Post()
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async createProduct(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    body: {
      name: string;
      productCategoryId: number | string;
      minimumStock: number | string;
      description?: string;
      unitId?: number | string; // Opcional
    },
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    // Parseo robusto
    const productCategoryId =
      body.productCategoryId !== undefined && body.productCategoryId !== ''
        ? Number(body.productCategoryId)
        : undefined;

    const minimumStock =
      body.minimumStock !== undefined && body.minimumStock !== ''
        ? Number(body.minimumStock)
        : undefined;

    if (productCategoryId === undefined || Number.isNaN(productCategoryId)) {
      throw new BadRequestException('productCategoryId es obligatorio y debe ser numérico.');
    }
    if (minimumStock === undefined || Number.isNaN(minimumStock)) {
      throw new BadRequestException('minimumStock es obligatorio y debe ser numérico.');
    }

    const unitId =
      body.unitId === null
        ? null
        : body.unitId === undefined || body.unitId === ''
        ? undefined
        : Number(body.unitId);

    if (unitId !== undefined && unitId !== null && Number.isNaN(unitId)) {
      throw new BadRequestException('unitId debe ser numérico.');
    }

    return this.productService.createProduct({
      name: body.name,
      productCategoryId,
      minimumStock,
      description: body.description,
      unitId: unitId === null ? undefined /* en create no “quitamos” */ : unitId,
      imageUrl,
    });
  }

  // ---------- READ ----------
  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('inStock') inStock?: string,
    @Query('lowStock') lowStock?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedCategoryId =
      categoryId !== undefined && categoryId !== '' ? Number(categoryId) : undefined;

    if (parsedCategoryId !== undefined && Number.isNaN(parsedCategoryId)) {
      throw new BadRequestException('categoryId debe ser numérico.');
    }

    const toBoolean = (value?: string): boolean | undefined => {
      if (value === undefined) return undefined;
      const normalized = String(value).toLowerCase();
      if (normalized === 'true' || normalized === '1') return true;
      if (normalized === 'false' || normalized === '0') return false;
      throw new BadRequestException('Parámetro booleano inválido. Usa true/false o 1/0.');
    };

    const parsePositiveInt = (value?: string): number | undefined => {
      if (value === undefined || value === '') return undefined;
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new BadRequestException('Parámetro de paginación inválido. Usa enteros mayores a 0.');
      }
      return parsed;
    };

    const parsedPage = parsePositiveInt(page);
    const parsedLimit = parsePositiveInt(limit);

    const filters = {
      q: q?.trim() || undefined,
      categoryId: parsedCategoryId,
      inStock: toBoolean(inStock),
      lowStock: toBoolean(lowStock),
    };

    if (parsedPage !== undefined || parsedLimit !== undefined) {
      return this.productService.findProductsPage(filters, {
        page: parsedPage ?? 1,
        limit: parsedLimit ?? 20,
      });
    }

    return this.productService.findAllProducts(filters);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findProductById(id);
  }

  // ---------- UPDATE (con imagen opcional) ----------
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    body: {
      name?: string;
      productCategoryId?: number | string;
      minimumStock?: number | string;
      description?: string;
      unitId?: number | string | null; // null = quitar unidad
      imageUrl?: string; // opcional, si no suben archivo, puedes permitir setear una URL directa
      removeImage?: boolean | string;
    },
  ) {
    const dto: {
      name?: string;
      productCategoryId?: number;
      minimumStock?: number;
      description?: string;
      unitId?: number | null;
      imageUrl?: string | null;
    } = {};

    if (body.name !== undefined) dto.name = body.name;
    if (body.description !== undefined) dto.description = body.description;

    if (body.productCategoryId !== undefined && body.productCategoryId !== '') {
      const n = Number(body.productCategoryId);
      if (Number.isNaN(n)) throw new BadRequestException('productCategoryId debe ser numérico.');
      dto.productCategoryId = n;
    }

    if (body.minimumStock !== undefined && body.minimumStock !== '') {
      const n = Number(body.minimumStock);
      if (Number.isNaN(n)) throw new BadRequestException('minimumStock debe ser numérico.');
      dto.minimumStock = n;
    }

    // Tri-estado para unitId: undefined (no tocar), null (quitar), number (asignar)
    if (body.unitId !== undefined) {
      if (body.unitId === null || body.unitId === 'null') {
        dto.unitId = null;
      } else if (body.unitId === '') {
        // vacío → no tocar
      } else {
        const n = Number(body.unitId);
        if (Number.isNaN(n)) throw new BadRequestException('unitId debe ser numérico.');
        dto.unitId = n;
      }
    }

    // Imagen: si suben archivo nuevo, priorizamos ese.
    const shouldRemoveImage = body.removeImage === true || body.removeImage === 'true';

    if (file) {
      dto.imageUrl = `/uploads/${file.filename}`;
    } else if (shouldRemoveImage) {
      dto.imageUrl = null;
    } else if (body.imageUrl !== undefined) {
      dto.imageUrl = body.imageUrl;
    }

    return this.productService.updateProduct(id, dto);
  }

  // ---------- DELETE ----------
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }
}
