import dotenv from 'dotenv';
import { AccessTokenTable, AuthLogic, UserTable } from './test-util';
import supertest from 'supertest';
import { web } from '../src/config/web';
import { logger } from '../src/config/logging';

dotenv.config();

let cookies: string | string[];
let refresh_token: string | null;

describe('Service Auth', () => {
  beforeAll(async () => {
    await UserTable.delete();
    await AccessTokenTable.delete();
    await UserTable.resetUserIdSequence();
    await AccessTokenTable.resetAccessTokenIdSequence();
    await UserTable.callUserSeed();
  });

  afterAll(async () => {
    await UserTable.delete();
    await AccessTokenTable.delete();
  });

  describe('Login And Logout', () => {
    it('Error Login', async () => {
      const response = await supertest(web).post('/api/login').send({
        email: '',
        password: '',
      });

      logger.debug('Logger Login', response.body);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'Invalid email',
          'Email is required',
          'Password is required',
        ])
      );
      expect(response.status).toBe(400);
    });

    it('Error Login: Email or password is incorrect!', async () => {
      const response = await supertest(web).post('/api/login').send({
        email: 'admin2@arzhi.com',
        password: 'test123',
      });

      logger.debug('Logger Login', response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['Email or password is incorrect!'])
      );

      const response2 = await supertest(web).post('/api/login').send({
        email: 'admin@arzhi.com',
        password: 'test123',
      });

      logger.debug('Logger Login', response2.body);
      expect(response2.status).toBe(400);
      expect(response2.body.errors).toEqual(
        expect.arrayContaining(['Email or password is incorrect!'])
      );
    });

    it('Success Login', async () => {
      const response = await AuthLogic.getLoginSuperAdmin();

      logger.debug('Logger Login', response.body);
      expect(response.status).toBe(200);

      // Simpan cookie dari respons login
      cookies = response.headers['set-cookie'];
      refresh_token = response.body.refresh_token;
    });

    it('Success Logout', async () => {
      const cookieHeader = Array.isArray(cookies)
        ? cookies.join('; ')
        : cookies;

      const response = await supertest(web)
        .post('/api/logout')
        .set('Cookie', cookieHeader);

      logger.debug('Logger Logout', response.body);
      expect(response.status).toBe(200);
    });
  });

  describe('Service profile', () => {
    it('error check middleware verify token', async () => {
      const response = await supertest(web).get('/api/profile');

      logger.debug('Logger profile', response.body);
      expect(response.status).toBe(401);
    });

    it('success check profile', async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      const cookieHeader = Array.isArray(cookies)
        ? cookies.join('; ')
        : cookies;

      const response = await supertest(web)
        .get('/api/profile')
        .set('Cookie', cookieHeader);

      logger.debug('Logger profile', response.body);
      expect(response.status).toBe(200);
    });
  });

  describe('Service refresh token', () => {
    it('Error refresh token forbidden', async () => {
      const response = await supertest(web).post('/api/refresh-token');

      logger.debug('Logger refresh token', response.body);
      expect(response.status).toBe(403);
    });

    it('success refresh token', async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      const response = await supertest(web).post('/api/refresh-token').send({
        refresh_token,
      });

      logger.debug('Logger refresh token', response.body);
      expect(response.status).toBe(200);
    });

    it('Error refresh token forbidden use refresh token same', async () => {
      const response = await supertest(web).post('/api/refresh-token').send({
        refresh_token,
      });

      logger.debug('Logger refresh token', response.body);
      expect(response.status).toBe(403);
    });
  });
});
