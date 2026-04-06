import { Module } from '@nestjs/common';
import { ViewsModule } from './views/views.module';

@Module({
  imports: [ViewsModule],
  exports: [ViewsModule],
})
export class EngagementModule {}
