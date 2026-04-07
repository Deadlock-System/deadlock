import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

const EXPIRE_VIEWER_KEY = process.env.EXPIRE_VIEWER_KEY;

@Injectable()
export class ViewsService {
  private readonly redis: Redis;
  private readonly logger = new Logger(ViewsService.name);

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
  }

  async incrementView(postId: string, fingerprint: string) {
    try {
      const viewerKey = `post:${postId}:views`;
      const syncQueueKey = 'views:sync_pending';

      const isNewView = await this.redis.sadd(viewerKey, fingerprint);
      if (isNewView === 1) {
        await this.redis.hincrby(syncQueueKey, postId, 1);
        await this.redis.expire(viewerKey, EXPIRE_VIEWER_KEY || 86400); // 24h
        this.logger.debug(`Incremented view for post ${postId}`);
      }
    } catch (error: unknown) {
      this.logger.error('Error incrementing view:', error);
    }
  }
}
