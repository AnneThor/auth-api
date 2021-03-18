'use strict';

process.env.SECRET = "keyboard cat";

const supergoose = require('@code-fellows/supergoose');
const { server } = require('../src/server.js');
const mockRequest = supergoose(server);

let validItem = { name: 'pizza', calories: 500, type: 'PROTEIN' };
let updItem = { name: 'strawberry', calories: 10, type: 'FRUIT' };
let invalidItem = { fruit: 'bat' };

describe("BEARER AUTH ROUTES WITH ACL implemented", () => {

  let users = [
    { username: 'admin', password: 'password', role: 'admin' },
    { username: 'editor', password: 'password', role: 'editor' },
    { username: 'user', password: 'password', role: 'user' },
  ]

  let registeredUsers = {};

  // Assign tokens to users of different roles
  beforeAll( async () => {
    let newAdmin = await mockRequest.post('/signup').send(users[0]);
    registeredUsers.admin = newAdmin.body.token;
    let newEditor = await mockRequest.post('/signup').send(users[1]);
    registeredUsers.editor = newEditor.body.token;
    let newUser = await mockRequest.post('/signup').send(users[2]);
    registeredUsers.user = newUser.body.token;
  })

  // TESTS TO POST: /api/v2/:model
  test('that a user with no token cannot access the create route', async () => {
    await mockRequest.post('/api/v2/food').send(validItem)
      .then(reply => {
        expect(reply.status).toEqual(500);
      })
  })

  test('that a user with a bearer token but with no create permission cannot create a user', async () => {
    //sign in with user that has no create function
    let token = registeredUsers.user;
    await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`)
                     .then(reply => {
                       expect(reply.status).toBe(500);
                     })
  })

  test('that a user with a bearer token and create permission can create a user', async () => {
    //sign in with editor who has create function
    let token = registeredUsers.editor;
    await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`)
                     .then(reply => {
                       expect(reply.status).toBe(201);
                       expect(reply.body.name).toBe('pizza');
                       expect(reply.body._id).toBeTruthy();
                     })
  })

  // TESTS TO GET /api/v2/:model
  test('that users with no token cannot access the read routes', async () => {
    await mockRequest.get('/api/v2/food')
      .then(reply => {
        expect(reply.status).toBe(500);
      })
  })

  test('that users with bearer token and read permissions can see list of items', async () => {
    //sign in with editor who has read privileges (and create privileges)
    let token = registeredUsers.editor;
    await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`);
    await mockRequest.get('/api/v2/food').set('Authorization', `${token}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body[0].name).toEqual('pizza');
      })
  })

  // TESTS TO GET /api/v2/:model/:id
  test('that users with no authorization cannot access model by id', async () => {
    let token = registeredUsers.editor;
    const newItem = await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`);
    let itemId = newItem.body._id;
    await mockRequest.get(`/api/v2/food/${itemId}`)
      .then(reply => {
        expect(reply.status).toBe(500);
      })
  })

  test('that users with read properties can access model by id', async () => {
    let token = registeredUsers.editor;
    const newItem = await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`);
    let itemId = newItem.body._id;
    await mockRequest.get(`/api/v2/food/${itemId}`).set('Authorization', `${token}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body._id).toEqual(itemId);
      })
  })

  // TESTS TO PUT /api/v2/:model:id
  test('that users with no authorization cannot update model by id', async () => {
    let token = registeredUsers.admin;
    const newItem = await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`);
    let itemId = newItem.body._id;
    await mockRequest.put(`/api/v2/food/${itemId}`).send(updItem)
      .then(reply => {
        expect(reply.status).toBe(500);
      })
  })

  test('that users with update properties can update model by id', async () => {
    let token = registeredUsers.editor;
    const newItem = await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`);
    let itemId = newItem.body._id;
    await mockRequest.put(`/api/v2/food/${itemId}`)
                     .set('Authorization', `${token}`)
                     .send(updItem)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body._id).toEqual(itemId);
        expect(reply.body.name).toEqual('strawberry');
        expect(reply.body.calories).toEqual(10);
      })
   await mockRequest.get(`/api/v2/food/${itemId}`)
                    .set('Authorization', `${token}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body.name).toBe('strawberry');
      })
  })

  // TESTS TO PUT /api/v2/:model:id
  test('that users with no authorization cannot delete a model by id', async () => {
    let token = registeredUsers.admin;
    const newItem = await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`);
    let itemId = newItem.body._id;
    await mockRequest.delete(`/api/v2/food/${itemId}`)
      .then(reply => {
        expect(reply.status).toBe(500);
      })
  })

  test('that users without delete capability cannot delete a model by id', async () => {
    let token = registeredUsers.admin;
    const newItem = await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`);
    let itemId = newItem.body._id;
    token = registeredUsers.editor;
    await mockRequest.delete(`/api/v2/food/${itemId}`).set('Authorization', `${token}`)
      .then(reply => {
        expect(reply.status).toBe(500);
      })
  })

  test('that users with delete properties can delete model by id', async () => {
    let token = registeredUsers.admin;
    const newItem = await mockRequest.post('/api/v2/food')
                     .send(validItem)
                     .set('Authorization', `${token}`);
    let itemId = newItem.body._id;
    await mockRequest.delete(`/api/v2/food/${itemId}`)
                     .set('Authorization', `${token}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body._id).toEqual(itemId);
        expect(reply.body.name).toEqual('pizza');
        expect(reply.body.calories).toEqual(500);
      })
    await mockRequest.get(`/api/v2/food/${itemId}`)
                    .set('Authorization', `${token}`)
      .then(reply => {
        expect(reply.status).toBe(200);
        expect(reply.body).toBe(null);
      })
  })

})
