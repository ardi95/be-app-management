import dotenv from 'dotenv';
import { AccessTokenTable, AuthLogic, UserTable } from '../test-util';
import supertest from 'supertest';
import { web } from '../../src/config/web';
import { logger } from '../../src/config/logging';

dotenv.config();

const baseUrlTest = '/api/app-management/menu';

let cookies: string | string[];
let refresh_token: string | null;
let cookieHeader: string | null;

describe('Service Menu', () => {
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

    it('Should be error if the body request is not filled in', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should error if the body request is not filled in',
        response.body
      );

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'The key menu is required!',
          'The name is required!',
        ])
      );
      expect(response.status).toBe(400);
    });

    it('Success to add menu', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'Test',
          name: 'Test',
        });

      logger.debug('Logger Success to add menu', response.body);

      expect(response.body.data.order_number).toBe(2);
      expect(response.body.data.key_menu).toBe('test');
      expect(response.status).toBe(200);
    });

    it('Should be error because the parent menu is not found', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'test',
          name: 'Test',
          menu_id: 10,
        });

      logger.debug(
        'Logger Should be error because the parent menu is not found',
        response.body
      );
      expect(response.status).toBe(404);
    });

    it('Should be error because the key menu must be unique', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'Test',
          name: 'Test',
        });

      logger.debug(
        'Logger Should be error because the key menu must be unique',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The key menu cannot be the same!'])
      );
      expect(response.status).toBe(400);
    });

    it('Success to add submenu', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'submenu',
          name: 'Submenu',
          url: '/submenu',
          menu_id: 1,
        });

      logger.debug('Logger Success to add submenu', response.body);

      expect(response.body.data.order_number).toBe(5);
      expect(response.body.data.key_menu).toBe('submenu');
      expect(response.status).toBe(200);
    });

    it('Success to add submenu 2', async () => {
      const response = await supertest(web)
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'submenu2',
          name: 'Submenu2',
          url: '/submenu2',
          menu_id: 1,
        });

      logger.debug('Logger Success to add submenu 2', response.body);

      expect(response.body.data.order_number).toBe(6);
      expect(response.body.data.key_menu).toBe('submenu2');
      expect(response.status).toBe(200);
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

    it('Success to get list menu', async () => {
      const response = await supertest(web)
        .get(baseUrlTest + '/0')
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success to get list menu', response.body);
      expect(response.body.data[0].key_menu).toBe('appmanagement');
      expect(response.body.data[0].children.length).toBe(4);
      expect(response.status).toBe(200);
    });

    it('Success to get list submenu', async () => {
      const response = await supertest(web)
        .get(baseUrlTest + '/1')
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success to get list submenu', response.body);
      expect(response.body.data[0].key_menu).toBe('user');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Detail', () => {
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

    it('Should be error because the menu does not exist', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/10/detail`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Logger Should be error because the menu does not exist',
        response.body
      );
      expect(response.status).toBe(404);
    });

    it('Success to get detail menu', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/2/detail`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success get detail menu', response.body);
      expect(response.body.data.key_menu).toBe('user');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Update', () => {
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

    it('Should be error because the menu does not exist', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/detail/10`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'submenu',
          name: 'Submenu',
          url: '/submenu',
          menu_id: 1,
        });

      logger.debug(
        'Logger Should be error because the menu does not exist',
        response.body
      );
      expect(response.status).toBe(404);
    });

    it('Should be error because the key menu must be unique', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'appmanagement',
          name: 'Test',
        });

      logger.debug(
        'Logger Should be error because the key menu must be unique',
        response.body
      );
      expect(response.body.errors).toEqual(
        expect.arrayContaining(['The key menu cannot be the same!'])
      );
      expect(response.status).toBe(400);
    });

    it('Success to edit data menu with key menu same and id same', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'user',
          name: 'Submenu',
          url: '/submenu',
          menu_id: 1,
        });

      logger.debug(
        'Logger Success to edit data menu with key menu same and id same',
        response.body
      );
      expect(response.body.data.key_menu).toBe('user');
      expect(response.status).toBe(200);
    });

    it('Success to edit data menu', async () => {
      const response = await supertest(web)
        .patch(`${baseUrlTest}/2`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'submenuchange',
          name: 'Submenu',
          url: '/submenu',
          menu_id: 1,
        });

      logger.debug('Logger Success to edit data role', response.body);
      expect(response.body.data.key_menu).toBe('submenuchange');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Sort', () => {
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

    it('Should be error because the list menu must contain more equal to than 1 item', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/sort/1`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        'Should be error because the list menu must contain more equal to than 1 item',
        response.body
      );

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          'The list menu must contain more equal to than 1 item!',
        ])
      );
      expect(response.status).toBe(400);
    });

    it('Should be error because the id list not found', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/sort/1`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          list_menu: [
            {
              id: 2,
            },
            {
              id: 10,
            },
          ],
        });

      logger.debug(
        'Should be error because the id list not found',
        response.body
      );

      expect(response.status).toBe(404);
    });

    it('Success sort menu', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/sort/1`)
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

      const responseList = await supertest(web)
        .get(`${baseUrlTest}/1/detail`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Success sort menu', responseList.body);
      expect(response.status).toBe(200);
      expect(responseList.body.data.children[0].key_menu).toBe('role');
    });

    it('Success step 2 sort menu', async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/sort/1`)
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

      const responseList = await supertest(web)
        .get(`${baseUrlTest}/1/detail`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Success sort menu', responseList.body);
      expect(response.status).toBe(200);
      expect(responseList.body.data.children[0].key_menu).toBe('role');
    });
  });

  describe('Service Change Parent', () => {
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
      for (let index = 1; index <= 2; index++) {
        await supertest(web)
          .post(baseUrlTest)
          .set('Cookie', cookieHeader ?? '')
          .send({
            key_menu: `Test${index}`,
            name: `Test${index}`,
          });
      }

      for (let index = 1; index <= 3; index++) {
        await supertest(web)
          .post(baseUrlTest)
          .set('Cookie', cookieHeader ?? '')
          .send({
            key_menu: `submenu${index}`,
            name: `Submenu${index}`,
            url: `/submenu${index}`,
            menu_id: 1,
          });
      }
    });

    it("Should be error because the menu doesn't exist", async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/10/change-parent`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        "Should be error because the menu doesn't exist",
        response.body
      );

      expect(response.status).toBe(404);
    });

    it("Should be error because the parent menu doesn't exist", async () => {
      const response = await supertest(web)
        .post(`${baseUrlTest}/5/change-parent`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          menu_id: 10,
        });

      logger.debug(
        "Should be error because the parent menu doesn't exist",
        response.body
      );

      expect(response.status).toBe(404);
    });

    it('Success change parent', async () => {
      await supertest(web)
        .post(`${baseUrlTest}/change-parent/5`)
        .set('Cookie', cookieHeader ?? '')
        .send({
          menu_id: 2,
        });

      const response = await supertest(web)
        .get(baseUrlTest + '/2')
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Success change parent', response.body);

      expect(response.body.data[0].key_menu).toBe('rolemenu');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Delete', () => {
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
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'Test',
          name: 'Test',
        });

      for (let index = 1; index <= 3; index++) {
        await supertest(web)
          .post(baseUrlTest)
          .set('Cookie', cookieHeader ?? '')
          .send({
            key_menu: `submenu${index}`,
            name: `Submenu${index}`,
            url: `/submenu${index}`,
            menu_id: 1,
          });
      }
    });

    it("Should be error because the menu doesn't exist", async () => {
      const response = await supertest(web)
        .delete(`${baseUrlTest}/10`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        "Should be error because the menu doesn't exist",
        response.body
      );

      expect(response.status).toBe(404);
    });

    it('Success Inactive menu', async () => {
      const response = await supertest(web)
        .delete(`${baseUrlTest}/4`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        "Should be error because the menu doesn't exist",
        response.body
      );

      expect(response.body.data.active).toBe('Inactive');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Active', () => {
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
        .post(baseUrlTest)
        .set('Cookie', cookieHeader ?? '')
        .send({
          key_menu: 'Test',
          name: 'Test',
        });

      for (let index = 1; index <= 3; index++) {
        await supertest(web)
          .post(baseUrlTest)
          .set('Cookie', cookieHeader ?? '')
          .send({
            key_menu: `submenu${index}`,
            name: `Submenu${index}`,
            url: `/submenu${index}`,
            menu_id: 1,
          });
      }

      await supertest(web)
        .delete(`${baseUrlTest}/4`)
        .set('Cookie', cookieHeader ?? '');
    });

    it("Should be error because the menu doesn't exist", async () => {
      const response = await supertest(web)
        .put(`${baseUrlTest}/active/10`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug(
        "Should be error because the menu doesn't exist",
        response.body
      );

      expect(response.status).toBe(404);
    });

    it('Success Active menu', async () => {
      const response = await supertest(web)
        .put(`${baseUrlTest}/active/4`)
        .set('Cookie', cookieHeader ?? '');

      expect(response.body.data.active).toBe('Active');
      expect(response.status).toBe(200);
    });
  });

  describe('Service List Header', () => {
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

    it('Success to get list header', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/2/list-header`)
        .query({
          page: 1,
          per_page: 10,
        })
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success to get list user', response.body);
      expect(response.body.data[2].name).toBe('Role');
      expect(response.status).toBe(200);
    });

    it('Success to get menu structure', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}/2/list-header`)
        .query({
          order_field: 'name',
          order_dir: 'desc',
          page: 1,
          per_page: 10,
        })
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success to get menu structure', response.body);
      expect(response.body.data[3].key_menu).toBe('appmanagement');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Get Menu Structure', () => {
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

    it('Success to get menu structure', async () => {
      const response = await supertest(web)
        .get(`${baseUrlTest}-structure`)
        .set('Cookie', cookieHeader ?? '');

      logger.debug('Logger Success to get menu structure', response.body);
      expect(response.body[0].key_menu).toBe('appmanagement');
      expect(response.body[0].children.length).toBe(4);
      expect(response.body[0].children[0].key_menu).toBe('user');
      expect(response.status).toBe(200);
    });
  });
});
