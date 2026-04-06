import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';
import { ViewsCron } from './views.cron';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ViewsService, ViewsCron],
  exports: [ViewsService],
})
export class ViewsModule {}
