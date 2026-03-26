import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignInUseCase } from './useCases/sign-in.usecase';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenService } from './services/token-service';
import { AuthRepository } from './repository/auth.repository';
import { UserRepository } from '../user/repository/user.repository';
import {
  InvalidRefreshTokenException,
  RefreshTokenNotFoundException,
} from './exceptions/auth.exceptions';
import { UserNotFoundException } from '../user/exceptions/user.exceptions';
import { compare, hash } from 'bcrypt';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { User } from '../user/entities/user.entity';
import { Seniority } from '../user/entities/enums/seniority.enum';
import * as https from 'https';

@Injectable()
export class AuthService {
  constructor(
    private signInUseCase: SignInUseCase,
    private tokenService: TokenService,
    private authRepository: AuthRepository,
    private userRepository: UserRepository,
  ) {}

  async authenticate(signInDto: SignInDto) {
    return await this.signInUseCase.execute(signInDto);
  }

  async generateAuthTokens(userId: string, username: string) {
    const payload = { sub: userId, username };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    await this.authRepository.refreshTokenRegister(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { userId, refreshToken } = refreshTokenDto;

    const refreshData = await this.authRepository.findByUserId(userId);
    if (!refreshData) throw new RefreshTokenNotFoundException();

    const isValid = await this.validateRefreshToken(
      refreshToken,
      refreshData.token,
    );
    if (!isValid) throw new InvalidRefreshTokenException();

    const userData = await this.userRepository.findByUserId(userId);
    if (!userData) throw new UserNotFoundException();

    const authTokens = await this.generateAuthTokens(userId, userData.username);

    return authTokens;
  }

  async registerWithGoogle(googleSignUpDto: { credential?: string }) {
    const { credential } = googleSignUpDto;

    const tokenInfo = await this.getGoogleTokenInfo(credential);

    const email = tokenInfo.email;
    const name = tokenInfo.name;
    const picture = tokenInfo.picture;

    let user = await this.userRepository.findByEmail(email);
    const isNewUser = !user;

    if (!user) {
      const usernameBase = this.normalizeUsername(
        name || email.split('@')[0] || 'user',
      );
      const username = await this.createUniqueUsername(usernameBase);

      const userToCreate = new User({
        email,
        username,
        userPhoto: picture,
        hashedPassword: await hash(randomUUID(), 10),
        seniorityId: Seniority.NOT_SELECTED,
      });

      user = await this.userRepository.create(userToCreate);
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    await this.authRepository.refreshTokenRegister(user.id, refreshToken);

    return { accessToken, refreshToken, isNewUser };
  }

  getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  private async validateRefreshToken(
    token: string,
    hashedToken: string,
  ): Promise<boolean> {
    return compare(token, hashedToken);
  }

  private async getGoogleTokenInfo(credential?: string): Promise<{
    aud: string;
    email: string;
    email_verified?: string;
    name?: string;
    picture?: string;
    sub: string;
  }> {
    if (!credential) {
      throw new BadRequestException('Credential é obrigatória');
    }

    const data = await this.getJsonFromUrl(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        credential,
      )}`,
    );

    const email = typeof data.email === 'string' ? data.email : undefined;
    const aud = typeof data.aud === 'string' ? data.aud : undefined;
    const sub = typeof data.sub === 'string' ? data.sub : undefined;
    const emailVerified =
      typeof data.email_verified === 'string' ? data.email_verified : undefined;
    const name = typeof data.name === 'string' ? data.name : undefined;
    const picture = typeof data.picture === 'string' ? data.picture : undefined;

    if (!email || !aud || !sub) {
      throw new UnauthorizedException('Token do Google inválido');
    }

    const expectedAudience = process.env.GOOGLE_CLIENT_ID;
    if (expectedAudience && expectedAudience !== aud) {
      throw new UnauthorizedException('Token do Google inválido');
    }

    if (emailVerified && emailVerified !== 'true') {
      throw new UnauthorizedException('E-mail do Google não verificado');
    }

    return { aud, email, email_verified: emailVerified, name, picture, sub };
  }

  private getStateSecret(): string {
    return (
      process.env.JWT_SECRET ||
      process.env.JWT_ACCESS_SECRET ||
      'fake_jwt_secret'
    );
  }

  private createSignedState(): string {
    const payload = `${Date.now()}.${randomUUID()}`;
    const sig = createHmac('sha256', this.getStateSecret())
      .update(payload)
      .digest('base64url');
    return `${payload}.${sig}`;
  }

  private validateSignedState(state?: string): boolean {
    if (!state) return false;
    const parts = state.split('.');
    if (parts.length !== 3) return false;
    const payload = `${parts[0]}.${parts[1]}`;
    const sig = parts[2];

    const expected = createHmac('sha256', this.getStateSecret())
      .update(payload)
      .digest('base64url');

    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  private async getJsonFromUrl(
    urlString: string,
  ): Promise<Record<string, unknown>> {
    const url = new URL(urlString);

    return await new Promise<Record<string, unknown>>((resolve, reject) => {
      const req = https.request(
        {
          method: 'GET',
          hostname: url.hostname,
          path: `${url.pathname}${url.search}`,
          headers: {
            Accept: 'application/json',
          },
        },
        (res) => {
          const statusCode = res.statusCode ?? 0;
          const chunks: Buffer[] = [];

          res.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });

          res.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');

            if (statusCode < 200 || statusCode >= 300) {
              reject(new UnauthorizedException('Token do Google inválido'));
              return;
            }

            try {
              const parsed = JSON.parse(raw) as unknown;
              if (
                typeof parsed !== 'object' ||
                parsed === null ||
                Array.isArray(parsed)
              ) {
                reject(new UnauthorizedException('Token do Google inválido'));
                return;
              }
              resolve(parsed as Record<string, unknown>);
            } catch {
              reject(new UnauthorizedException('Token do Google inválido'));
            }
          });
        },
      );

      req.on('error', () => {
        reject(new UnauthorizedException('Token do Google inválido'));
      });

      req.end();
    });
  }

  private normalizeUsername(input: string): string {
    const normalized = input
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^[_\-.]+|[_\-.]+$/g, '');

    return normalized || 'user';
  }

  private async createUniqueUsername(base: string): Promise<string> {
    const safeBase = this.normalizeUsername(base);

    const existing = await this.userRepository.findByUsername(safeBase);
    if (!existing) return safeBase;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const candidate = `${safeBase}_${suffix}`;
      const conflict = await this.userRepository.findByUsername(candidate);
      if (!conflict) return candidate;
    }

    return `${safeBase}_${randomUUID().slice(0, 8)}`;
  }

  private async requestJson(input: {
    hostname: string;
    path: string;
    method: 'GET' | 'POST';
    headers: Record<string, string>;
    body?: string;
  }): Promise<any> {
    return await new Promise<any>((resolve, reject) => {
      const req = https.request(
        {
          method: input.method,
          hostname: input.hostname,
          path: input.path,
          headers: input.headers,
        },
        (res) => {
          const statusCode = res.statusCode ?? 0;
          const chunks: Buffer[] = [];

          res.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });

          res.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');

            if (statusCode < 200 || statusCode >= 300) {
              reject(new UnauthorizedException('Falha no OAuth do GitHub'));
              return;
            }

            try {
              resolve(JSON.parse(raw));
            } catch {
              reject(new UnauthorizedException('Falha no OAuth do GitHub'));
            }
          });
        },
      );

      req.on('error', () => {
        reject(new UnauthorizedException('Falha no OAuth do GitHub'));
      });

      if (input.body) {
        req.write(input.body);
      }

      req.end();
    });
  }
}
