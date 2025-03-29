import dotenv from 'dotenv';
import { AccessTokenTable, AuthLogic, UserTable } from '../test-util';
import supertest from 'supertest';
import { web } from '../../src/config/web';
import { logger } from '../../src/config/logging';
import { prismaClient } from '../../src/config/database';

dotenv.config();

const baseUrlTest = '/api/app-management/role-menu';
const baseUrlMenuTest = '/api/app-management/menu';

let cookies: string | string[];
let refresh_token: string | null;
let cookieHeader: string | null;

describe('Service Role Menu', () => {
  describe('Service Store', () => {
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

    it('first this test', async () => {
      await supertest(web)
        .post(baseUrlMenuTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'Test',
          name: 'Test',
        });

      for (let index = 1; index <= 3; index++) {
        await supertest(web)
          .post(baseUrlMenuTest)
          .set('Cookie', cookieHeader ?? '')
          .send({
            key_menu: `submenu${index}`,
            name: `Submenu${index}`,
            url: `/submenu${index}`,
            menu_id: 1,
          });
      }
    });

    it('Should be error because the role does not exist', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/10`)
        .set('Cookie', cookieHeader ?? '')
        .send([
          {
            menu_id: 1,
            active: true,
          },
        ]);

      logger.debug(
        'Logger Should be error because the role does not exist',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['Role or Menu not found!'])
      );
      expect(response.status).toBe(404);
    });

    it('Should be error because the menu does not exist', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/1`)
        .set('Cookie', cookieHeader ?? '')
        .send([
          {
            menu_id: 10,
            active: true,
          },
        ]);

      logger.debug(
        'Logger Should be error because the menu does not exist',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['Role or Menu not found!'])
      );
      expect(response.status).toBe(404);
    });

    it('Success config role menu', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/1`)
        .set('Cookie', cookieHeader ?? '')
        .send([
          {
            menu_id: 1,
            active: true,
          },
        ]);

      logger.debug('Logger Success config role menu', response.body);
      expect(response.status).toBe(200);
    });

    it('Success config no multiple row in table with multiple input', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/1`)
        .set('Cookie', cookieHeader ?? '')
        .send([
          {
            menu_id: 1,
            active: true,
            create: true,
          },
        ]);

      const data = await prismaClient.roleMenu.findMany();

      expect(response.status).toBe(200);
      expect(data.length).toBe(1);
    });
  });

  describe('Service List', () => {
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

    it('first this test', async () => {
      await supertest(web)
        .post(baseUrlMenuTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'Test',
          name: 'Test',
        });

      for (let index = 1; index <= 3; index++) {
        await supertest(web)
          .post(baseUrlMenuTest)
          .set('Cookie', cookieHeader ?? '')
          .send({
            key_menu: `submenu${index}`,
            name: `Submenu${index}`,
            url: `/submenu${index}`,
            menu_id: 1,
          });
      }

      await supertest(web)
        .post(`${baseUrlTest}/1`)
        .set('Cookie', cookieHeader ?? '')
        .send([
          {
            menu_id: 1,
            active: true,
          },
          {
            menu_id: 2,
            active: true,
            create: true,
          },
          {
            menu_id: 3,
            active: true,
            update: true,
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
          ],
        });
    });

    it('Should be error because the role does not exist', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/10/1`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should be error because the role does not exist',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The role does not exist!'])
      );
      expect(response.status).toBe(404);
    });

    it('Should be error because the menu does not exist', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/1/10`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should be error because the menu does not exist',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The menu does not exist!'])
      );
      expect(response.status).toBe(404);
    });

    it('Success get role menu', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/1/1`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success get role menu', response.body);
      expect(response.status).toBe(200);
    });

    it('Success only 2 menu if 1 submenu is Inactive', async () => {
      await supertest(web)
        .delete(`${baseUrlMenuTest}/4`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          active: 'Inactive',
        });

      const response = await supertest(web)
        .get(`${baseUrlTest}/1/1`)
        .set('Cookie', cookieHeader ?? '');

      expect(response.body.data.length).toBe(2);
    });
  });
});
