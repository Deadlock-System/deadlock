import { Module } from '@nestjs/common';
import { ViewsModule } from './views/views.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [ViewsModule, VotesModule],
  exports: [ViewsModule, VotesModule],
})
export class EngagementModule {}
