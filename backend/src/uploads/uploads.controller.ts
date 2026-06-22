import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10MB

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('foto')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: TAMANHO_MAXIMO } }))
  async enviarFoto(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido');
    }
    return this.uploadsService.enviarFoto(file);
  }
}
