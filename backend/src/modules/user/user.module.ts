import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from './repositories/user.repository';
import { PrismaRepository } from './repositories/prisma/prisma-user.repository';
import { UserProviderRepository } from './repositories/user-provider.repository';
import { PrismaUserProviderRepository } from './repositories/prisma/prisma-user-provider.repository';
import { PostsModule } from '../content/posts/posts.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), PostsModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: PrismaRepository,
    },
    {
      provide: UserProviderRepository,
      useClass: PrismaUserProviderRepository,
    },
  ],
  exports: [UserRepository, UserProviderRepository],
})
export class UserModule {}
