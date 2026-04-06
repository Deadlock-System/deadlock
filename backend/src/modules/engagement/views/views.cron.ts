import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ViewsCron {
  private readonly logger = new Logger(ViewsCron.name);
  private readonly redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncViewsToDatabase() {
    this.logger.debug('Starting sync views batch (Redis -> Postgres)...');

    const syncQueueKey = 'views:sync_pending';

    try {
      const pending = await this.redis.hgetall(syncQueueKey);
      const postIds = Object.keys(pending);

      if (postIds.length === 0) {
        this.logger.debug('No pending views to sync.');
        return;
      }

      const updatePromises = postIds.map((postId) => {
        const newViews = parseInt(pending[postId], 10);

        return this.prisma.post.update({
          where: { id: postId },
          data: { views: newViews },
        });
      });

      await this.prisma.$transaction(updatePromises);
      await this.redis.del(syncQueueKey, ...postIds);

      this.logger.log(
        `Views synced successfully. ${postIds.length} posts updated.`,
      );
    } catch (error) {
      this.logger.error('Error syncing views:', error.stack);
    }
  }
}
