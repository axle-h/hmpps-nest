import { HttpModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HmppsStrategy } from './hmpps.strategy';
import { LoginController } from './login/login.controller';
import { UserService } from './user/user.service';
import { SessionSerializer } from './session.serializer';
import { LogoutController } from './logout/logout.controller';

@Module({
  imports: [HttpModule, PassportModule.register({ session: true, defaultStrategy: 'hmpps' })],
  providers: [HmppsStrategy, UserService, SessionSerializer],
  controllers: [LoginController, LogoutController],
})
export class AuthModule {}
