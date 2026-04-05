import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';

@Module({
  providers: [ViewsService],
  exports: [ViewsService],
})
export class ViewsModule {}
