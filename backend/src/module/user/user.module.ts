import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repository/user.repository';
import { PrismaRepository } from './repository/prisma-user.repository';
import { PrismaModule } from 'src/module/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: PrismaRepository,
    },
  ],
  exports: [UserRepository],
})
export class UserModule {}
