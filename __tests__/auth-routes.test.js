'use strict';

process.env.SECRET = "keyboard cat";

const supergoose = require('@code-fellows/supergoose');
// const supertest = require('supertest');
const { server } = require('../src/server.js');
const authRouter = require('../src/auth/auth-router.js');
const mockRequest = supergoose(server);

let user = { username: 'admin', password: 'password' };


describe("AUTH ROUTER FUNCTIONALITY", () => {

  test('that POST /signup will return an error when given invalid inputs', async () => {
    await mockRequest.post('/signup').send({})
      .then(reply => {
        expect(reply.status).toBe(500);
        expect(reply.body.user).toBeFalsy();
      });
  })

  test('that the signup function returns a user given proper inputs', async () => {
    await mockRequest.post('/signup').send(user)
      .then(reply => {
        expect(reply.status).toBe(201);
        expect(reply.body.user.username).toEqual('admin');
        expect(reply.body.user.token).toBeTruthy();
      })
  });


});
