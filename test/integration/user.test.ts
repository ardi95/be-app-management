import dotenv from 'dotenv';
import { AccessTokenTable, AuthLogic, UserTable } from '../test-util';
import supertest from 'supertest';
import { web } from '../../src/config/web';
import { logger } from '../../src/config/logging';
dotenv.config();

const baseUrlTest = '/api/app-management/user';

let cookies: string | string[];
let refresh_token: string | null;
let cookieHeader: string | null;

describe('Service User', () => {
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

  describe('Service Store', () => {
    beforeEach(async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    });

    it('Should be error if the name is not filled in', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should error if the name is not filled in',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'The email is required!',
          'The name is required!',
          'The gender is required!',
          'The birthdate is required!',
        ])
      );
      expect(response.status).toBe(400);
    });

    it('Should be error if the date of birth format is incorrect', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          email: 'test@gmail.com',
          name: 'test',
          gender: 'Male',
          birthdate: '24-04-1995',
        });

      logger.debug(
        'Logger Should be error if the date of birth format is incorrect',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The birthdate format must be: YYYY-MM-DD!'])
      );
      expect(response.status).toBe(400);
    });

    it('Success to add user', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          email: 'test@gmail.com',
          name: 'test',
          gender: 'Male',
          birthdate: '1995-04-24',
        });

      logger.debug('Logger Success to add user', response.body);
      expect(response.status).toBe(200);
    });

    it('Should be error because the email must be unique', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          email: 'test@gmail.com',
          name: 'test',
          gender: 'Male',
          birthdate: '1995-04-24',
        });

      logger.debug(
        'Logger Should be error because the email must be unique',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The email cannot be the same!'])
      );
      expect(response.status).toBe(400);
    });
  });

  describe('Service List', () => {
    beforeEach(async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    });

    it('Success to get list user', async () => {
      const response = await supertest(web)
        .get(baseUrlTest)
        .query({
          search: 'ad',
          order_field: 'name',
          order_dir: 'asc',
          page: 1,
          per_page: 10,
        })
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success to get list user', response.body);
      expect(response.body.data[0].name).toBe('Admin');
      expect(response.status).toBe(200);
    });
  });

  describe('Service update', () => {
    beforeEach(async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    });

    it('Should be error because the user does not exist', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/3`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          email: 'test@gmail.com',
          name: 'test',
          gender: 'Male',
          birthdate: '1995-04-24',
        });

      logger.debug(
        'Logger Should be error because the user does not exist',
        response.body
      );
      expect(response.status).toBe(404);
    });

    it('Should be error because the email must be unique', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          email: process.env.EMAIL_ADMIN,
          name: 'test',
          gender: 'Male',
          birthdate: '1995-04-24',
        });

      logger.debug(
        'Logger Should be error because the email must be unique',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The email cannot be the same!'])
      );
      expect(response.status).toBe(400);
    });

    it('Success to edit data user', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          email: 'test@gmail.com',
          name: 'test2',
          gender: 'Male',
          birthdate: '1995-04-24',
        });

      logger.debug('Logger Success to edit data user', response.body);
      expect(response.body.data.name).toBe('test2');
      expect(response.status).toBe(200);
    });
  });

  describe('Service reset password', () => {
    beforeEach(async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    });

    it('Success to reset password user', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/reset-password/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          email: 'test@gmail.com',
          name: 'test',
          gender: 'Male',
          birthdate: '1995-04-24',
        });

      logger.debug('Logger Success to reset password usert', response.body);
      expect(response.body.data.active).toBe('Inactive');
      expect(response.status).toBe(200);
    });
  });
});
