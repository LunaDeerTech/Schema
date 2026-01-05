import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
       if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
           return cb(new BadRequestException('Only image files are allowed!'), false);
       }
       cb(null, true);
    }
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
        throw new BadRequestException('File is required');
    }
    return {
      url: `/uploads/${file.filename}`,
    };
  }
}
