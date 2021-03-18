'use strict';

process.env.SECRET = "keyboard cat";

const supergoose = require('@code-fellows/supergoose');
const { server } = require('../src/server.js');
const mockRequest = supergoose(server);

let validItem = { name: 'pizza', calories: 500, type: 'PROTEIN' };
let validItemTwo = { name: 'lettuce', calories: 0, type: 'VEGETABLE' };
let invalidItem = { fruit: 'bat' };

describe("Unauthenticated Server Routes", () => {

  test('that POST to /api/v1/:model with invalid inputs returns an error', async () => {
    await mockRequest.post('/api/v1/food').send(invalidItem)
      .then(reply => {
        expect(reply.status).toBe(500);
        expect(reply.body.message).toEqual('database error');
      })
  })

  test('that GET /api/v1/:model returns an empty object if no records', async () => {
    await mockRequest.get('/api/v1/food')
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body).toEqual([]);
      })
  })

  test('that POST to /api/v1/:model creates and returns object from db', async () => {
    await mockRequest.post('/api/v1/food').send(validItem)
      .then(reply => {
        expect(reply.status).toBe(201);
        expect(reply.body.name).toEqual('pizza');
        expect(reply.body._id).toBeTruthy();
      })
  })

  test('that GET /api/v1/:model returns a list of model items', async () => {
    await mockRequest.post('/api/v1/food').send(validItem)
      .then( await mockRequest.get('/api/v1/food')
        .then(reply => {
          expect(reply.status).toBe(200);
          expect(reply.body).toBeTruthy();
          expect(reply.body[0].name).toEqual('pizza');
        }))
      })

  test('that GET to /api/v1/:model/:id returns a single item by id', async () => {
    const createRec = await mockRequest.post('/api/v1/food').send(validItem)
    const newItemId = createRec.body._id;
    await mockRequest.get(`/api/v1/food/${newItemId}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body.name).toBe('pizza');
        expect(reply.body._id).toEqual(newItemId);
      })
  });

  test('that PUT to /api/v1/:model/:id returns a single, updated item by id', async () => {
    let itemList = await mockRequest.get('/api/v1/food');
    let item = itemList.body[0];
    let itemID = item._id;
    let updItem = { name: 'strawberry', calories: 10, type: 'FRUIT' };
    await mockRequest.put(`/api/v1/food/${itemID}`).send(updItem)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body.name).toEqual('strawberry');
      })
    await mockRequest.get(`/api/v1/food/${itemID}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body.name).toEqual('strawberry');
      })
  })

  test('that DELETE to /api/v1/:model/:id returns an empty object', async () => {
    const createRec = await mockRequest.post('/api/v1/food').send(validItem)
    const newItemId = createRec.body._id;
    await mockRequest.delete(`/api/v1/food/${newItemId}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body.name).toBe('pizza');
      });
    await mockRequest.get(`/api/v1/food/${newItemId}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body).toEqual(null);
      })
  })

})
