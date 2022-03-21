import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { locationModel } from '../src/models/locationModel.js';
import { actorModel } from '../src/models/actorModel.js';
import { Server } from '../src/config/server.js';
import server from '../src/app.js';

describe('Location API endpoints', () => {
  const base = '/v1/locations';
  let agent, adminTest, explorerTest, locationTest, token, adminToken;

  beforeAll(async () => {
    agent = request.agent(server.instance);
    explorerTest = {
      name: 'test',
      surname: 'surname',
      email: 'test.explorer@gmail.com',
      password: 'abc123'
    };
    adminTest = {
      name: 'admin',
      surname: 'surname',
      email: 'test.admin@gmail.com',
      password: 'abc123',
      role: 'admin'
    };
    locationTest = {
      title: 'test.location',
      description: 'test description',
      type: 'restaurants',
      coordinates: {
          lat: 36.5210,
          long: 6.2805
      }
    };

    const admin = new actorModel(adminTest);
    await admin.save();
    const { body: actor } = await agent.post('/v1/register').send(explorerTest);
    token = await Server.createIdTokenFromCustomToken(actor.email);
    adminToken = await Server.createIdTokenFromCustomToken(adminTest.email);

    return initTestDatabase(locationTest);
  });

  afterAll(async () => {
    await cleanTestDatabase();
    return server.close();
  });

  describe('Locations endpoints', () => {

    test('should return the list of locations', async () => {
      const response = await agent.set('idtoken', token).get(base);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should create a new location', async () => {
      const payload = {
        title: 'test.location2',
        description: 'test description',
        type: 'restaurants',
        coordinates: {
            lat: 36.5210,
            long: 6.2805
        }
      };

      const response = await agent
        .set('idtoken', adminToken)
        .post(base)
        .send(payload);
      const location = await locationModel.findOne({ title: payload.title });
      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(location).not.toBeNull();
    });

    test('should fail if a explorer tries to create a new location', async () => {
      const payload = {
        title: 'test.location3',
        description: 'test description',
        type: 'restaurants',
        coordinates: {
            lat: 36.5210,
            long: 6.2805
        }
      };

      const response = await agent
        .set('idtoken', token)
        .post(base)
        .send(payload);
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should return an existing location', async () => {
      const location = await locationModel.findOne({ title: locationTest.title });
      const response = await agent.set('idtoken', adminToken).get(`${base}/${location._id}`);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should update an existing location', async () => {
      const location = await locationModel.findOne({ title: locationTest.title });
      const response = await agent
        .set('idtoken', adminToken)
        .patch(`${base}/${location._id}`)
        .send({ type: "bar" });
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.type).toBe("bar");
    });

    test('should delete an existing location', async () => {
      const location = await locationModel.findOne({ title: locationTest.title });
      const response = await agent.set('idtoken', adminToken).delete(`${base}/${location._id}`);
      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

  });
});

const initTestDatabase = async locationTest => {
  await locationModel.insertMany([locationTest]);
};

const cleanTestDatabase = async () => {
  await locationModel.deleteMany({ title: /.*test.location.*/i });
  await actorModel.deleteMany({ email: /.*test.*/i });
};