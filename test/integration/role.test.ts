import dotenv from 'dotenv';
import { AccessTokenTable, AuthLogic, UserTable } from '../test-util';
import supertest from 'supertest';
import { web } from '../../src/config/web';
import { logger } from '../../src/config/logging';

dotenv.config();
const baseUrlTest = '/api/app-management/role';

let cookies: string | string[];
let refresh_token: string | null;
let cookieHeader: string | null;

describe('Service Role', () => {
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
        expect.arrayContaining(['The name is required!'])
      );
      expect(response.status).toBe(400);
    });

    it('Success to add role', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          name: 'Staff',
        });

      logger.debug('Logger Success to add role', response.body);

      expect(response.status).toBe(200);
    });

    it('Should be error because the name must be unique', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          name: 'Staff',
        });

      logger.debug(
        'Logger Should be error because the name must be unique',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The name cannot be the same!'])
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

    it('Success to get list role', async () => {
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
      expect(response.body.data[0].name).toBe('Super Admin');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Detail', () => {
    beforeEach(async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    });

    it('Should be error because the role does not exist', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/3`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should be error because the role does not exist',
        response.body
      );
      expect(response.status).toBe(404);
    });

    it('Success to get detail role', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success get detail role', response.body);
      expect(response.status).toBe(200);
    });
  });

  describe('Service Update', () => {
    beforeEach(async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    });

    it('Should be error because the role does not exist', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/3`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          name: 'test',
        });

      logger.debug(
        'Logger Should be error because the role does not exist',
        response.body
      );
      expect(response.status).toBe(404);
    });

    it('Should be error because the name role must be unique', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          name: 'Super Admin',
        });

      logger.debug(
        'Logger Should be error because the name role must be unique',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The name cannot be the same!'])
      );
      expect(response.status).toBe(400);
    });

    it('Success to edit data role with name same and id same', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          name: 'Staff',
        });

      logger.debug('Logger Success to edit data role with name same and id same', response.body);
      expect(response.body.data.name).toBe('Staff');
      expect(response.status).toBe(200);
    });

    it('Success to edit data role', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          name: 'test2',
        });

      logger.debug('Logger Success to edit data role', response.body);
      expect(response.body.data.name).toBe('test2');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Delete', () => {
    beforeEach(async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    });

    it('Should be error because the role does not exist', async () => {
      const response = await supertest(web)
        .delete(`${baseUrlTest}/3`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should be error because the role does not exist',
        response.body
      );
      expect(response.status).toBe(404);
    });

    it('Should be an error because the role is related to the user', async () => {
      const response = await supertest(web)
        .delete(`${baseUrlTest}/1`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should be an error because the role is related to the user',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          "The role couldn't be deleted, because this role is relation with user!",
        ])
      );
      expect(response.status).toBe(400);
    });

    it('Success to delete data role', async () => {
      const response = await supertest(web)
        .delete(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success to delete data role', response.body);
      expect(response.body.data.name).toBe('test2');
      expect(response.status).toBe(200);
    });
  });
});
