import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  findByUserId(@GetUserId() userId: string) {
    return this.userService.findByUserId(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  update(@Body() updateUserDto: UpdateUserDto, @GetUserId() userId: string) {
    return this.userService.update(updateUserDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me/password')
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @GetUserId() userId: string,
  ) {
    return this.userService.updatePassword(updatePasswordDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
