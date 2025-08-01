import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FollowService } from './follow.service';
import { AuthenticateGuard } from 'src/common/guards/authenticate.guard';
import { uuidDto } from 'src/common/dtos/uuid.dto';
import { UserTokenDto } from 'src/auth/dto/user-token.dto';
import { UserToken } from 'src/common/params/user-token.param';

@Controller()
@UseGuards(AuthenticateGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow/:id')
  followUser(@Param() { id }: uuidDto, @UserToken() user: UserTokenDto) {
    return this.followService.followUser({
      followingId: id,
      followerId: user.sub,
    });
  }

  @Delete('unfollow/:id')
  unfollowUser(@Param() { id }: uuidDto, @UserToken() user: UserTokenDto) {
    return this.followService.unfollowUser({
      followingId: id,
      followerId: user.sub,
    });
  }

  @Get('followers')
  findFollowersByUserId(@UserToken() user: UserTokenDto) {
    return this.followService.findFollowersByUserId(user.sub);
  }

  @Get('following')
  findFollowingByUserId(@UserToken() user: UserTokenDto) {
    return this.followService.findFollowingByUserId(user.sub);
  }
}
