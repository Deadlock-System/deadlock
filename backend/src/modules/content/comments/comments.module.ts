import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { EngagementModule } from 'src/modules/engagement/engagement.module';

@Module({
  imports: [PrismaModule, EngagementModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
