import dotenv from 'dotenv';
import { AccessTokenTable, AuthLogic, UserTable } from '../test-util';
import supertest from 'supertest';
import { web } from '../../src/config/web';
import { logger } from '../../src/config/logging';

dotenv.config();

const baseUrlMenuTest = '/api/app-management/menu';
const baseUrlRoleTest = '/api/app-management/role';
const baseUrlRoleMenuTest = '/api/app-management/role-menu';

let cookies: string | string[];
let refresh_token: string | null;
let cookieHeader: string | null;

describe('Service Auth', () => {
  describe('Login And Logout', () => {
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

    it('Should be error because the body request is not filled in', async () => {
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
        email: process.env.EMAIL_ADMIN,
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

      await supertest(web)
        .post(baseUrlMenuTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: `submenuagain`,
          name: `Submenuagain`,
          url: `/submenuagain`,
          menu_id: 3,
        });

      await supertest(web)
        .post(baseUrlMenuTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: `submenuagainagain`,
          name: `Submenuagain`,
          url: `/submenuagain`,
          menu_id: 6,
        });

      await supertest(web)
        .post(`${baseUrlRoleMenuTest}/1`)
        .set('Cookie', cookieHeader ?? '')
        .send([
          {
            menu_id: 6,
            active: true,
            create: true,
          },
          {
            menu_id: 7,
            active: true,
            create: true,
          },
        ]);

      await supertest(web)
        .post(`${baseUrlMenuTest}/sort/1`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          list_menu: [
            {
              id: 3,
            },
            {
              id: 2,
            },
            {
              id: 4,
            },
            {
              id: 5,
            },
          ],
        });

      const response = await supertest(web)
        .get('/api/profile')
        .set('Cookie', cookieHeader);

      logger.debug('Logger profile', response.body);

      expect(response.body.menu[0].children.length).toBe(4);
      expect(response.body.menu[0].children[0].children.length).toBe(1);
      expect(response.body.menu[0].children[1].children.length).toBe(0);
      expect(response.status).toBe(200);
    });

    it('check menu 0 if role delete', async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      const cookieHeader = Array.isArray(cookies)
        ? cookies.join('; ')
        : cookies;

      console.log('ARDI3', baseUrlRoleTest);
      await supertest(web)
        .delete(`${baseUrlRoleTest}/1`)
        .set('Cookie', cookieHeader ?? '');

      const response = await supertest(web)
        .get('/api/profile')
        .set('Cookie', cookieHeader);

      console.log('ARDI2', response.body);
      console.log('ARDI', response.body.menu);

      expect(response.body.menu.length).toBe(0);
      expect(response.status).toBe(200);
    });
  });

  describe('Service Edit Profile', () => {
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

    beforeEach(async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    });

    it('Should be error if the name is not filled in', async () => {
      const response = await supertest(web)
        .patch('/api/edit-profile')
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should be error if the name is not filled in',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'The name is required!',
          'The gender is required!',
          'The birthdate is required!',
        ])
      );
      expect(response.status).toBe(400);
    });

    it('Success to edit data profile', async () => {
      const response = await supertest(web)
        .patch('/api/edit-profile')
        .send({
          name: 'admin2',
          gender: 'Male',
          birthdate: '1995-04-01',
        })
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success to edit data profile', response.body);
      expect(response.body.data.name).toBe('admin2');
      expect(response.status).toBe(200);
    });
  });

  describe('Service refresh token', () => {
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

  describe('Service Permission', () => {
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

    it('error check middleware verify token', async () => {
      const response = await supertest(web).get('/api/permission');

      expect(response.status).toBe(401);
    });

    it('Should be error because the key_menu is not filled in', async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      const cookieHeader = Array.isArray(cookies)
        ? cookies.join('; ')
        : cookies;

      const response = await supertest(web)
        .get('/api/permission')
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger permission', response.body);
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The key menu is required!'])
      );
      expect(response.status).toBe(400);
    });

    it('Success get permission', async () => {
      const responseLogin = await AuthLogic.getLoginSuperAdmin();

      // Simpan cookie dari respons login
      cookies = responseLogin.headers['set-cookie'];
      refresh_token = responseLogin.body.refresh_token;

      const cookieHeader = Array.isArray(cookies)
        ? cookies.join('; ')
        : cookies;

      const response = await supertest(web)
        .get('/api/permission?key_menu=user')
        .set('Cookie', cookieHeader ?? '');

      expect(response.status).toBe(200);
      expect(response.body.data.access).toBe(true);
      expect(response.body.data.create).toBe(true);
    });
  });
});
