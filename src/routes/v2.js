'use strict';

const fs = require('fs');
const express = require('express');
const Collection = require('../models/data-collection.js');
const bearerAuth = require('../auth/middleware/bearer.js');
const restrict = require('../auth/middleware/acl.js');
const aclRouter = new express.Router();

const models = new Map();

aclRouter.use(bearerAuth);

aclRouter.param('model', (req, res, next) => {
  const modelName = req.params.model;
  if (models.has(modelName)) {
    req.model = models.get(modelName);
    next();
  } else {
    const fileName = `${__dirname}/../models/${modelName}/model.js`;
    if (fs.existsSync(fileName)) {
      const model = require(fileName);
      models.set(modelName, new Collection(model));
      req.model = models.get(modelName);
      next();
    }
    else {
      next("Invalid Model");
    }
  }
});

// anyone with valid jwt can use get methods
aclRouter.get('/api/v2/:model', handleGetAll);
aclRouter.get('/api/v2/:model/:id', handleGetOne);
// restrict to users with CREATE capability
aclRouter.post('/api/v2/:model', restrict('create'), handleCreate);
// restrict to users with UPDATE capability
aclRouter.put('/api/v2/:model/:id', restrict('update'), handleUpdate);
aclRouter.patch('/api/v2/:model/:id', restrict('update'), handleUpdate);
// restrict to users with DELETE capability
aclRouter.delete('/api/v2/:model/:id', restrict('delete'), handleDelete);


async function handleGetAll(req, res) {
  let allRecords = await req.model.get();
  res.status(200).json(allRecords);
}

async function handleGetOne(req, res) {
  const id = req.params.id;
  let theRecord = await req.model.get(id)
  res.status(200).json(theRecord);
}

async function handleCreate(req, res) {
  let obj = req.body;
  let newRecord = await req.model.create(obj);
  res.status(201).json(newRecord);
}

async function handleUpdate(req, res) {
  const id = req.params.id;
  const obj = req.body;
  let updatedRecord = await req.model.update(id, obj)
  res.status(200).json(updatedRecord);
}

async function handleDelete(req, res) {
  let id = req.params.id;
  let deletedRecord = await req.model.delete(id);
  res.status(200).json(deletedRecord);
}

module.exports = aclRouter;
