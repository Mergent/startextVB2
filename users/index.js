const express = require('express');
const decode = require('jwt-decode')
const { v4: uuidv4 } = require('uuid');

const { createElem, deleteByIds, filterSort, paginationSort, putElemById, addElemOnArrayWithId, pushElem, readFile, putElemToCMSById, pushElemToCMS, filteredAndPaginationSort } = require("../utils.js");
const { defaultUserProperties } = require('../cmsUtils.js');

const filePath = './users/data.json'
const cmsFilePath = './users/cms.json'
const router = express.Router();

router.get('/db/users', (req, res) => {
  const users = readFile(filePath)
  const params = req.query
  res.send(filteredAndPaginationSort(users, params))
});

router.get('/db/user', (req, res) => {
  const users = readFile(filePath)
  const user = req.headers.authorization.substring(7)
  const username = decode(user).user_name
  res.send(users.find(user => user.username === username))
});

router.get('/db/user/:userId', (req, res) => {
  const users = readFile(filePath)
  const userId = req.params.userId
  const user = users.find(user => user.id === userId)
  if (user) {
    res.send(user)
    return
  }
  res.status(404).send({ error: "User not found" })
});

router.post('/db/user', (req, res) => {
  const { body } = req
  const users = readFile(filePath)
  const newUser = pushElem(users, body, filePath)
  res.send(newUser)
});

router.delete('/db/users', (req, res) => {
  const { body } = req
  const users = readFile(filePath)
  const newUsers = deleteByIds(users, body, filePath)
  res.send(newUsers)
});

router.put('/db/user/:userId', (req, res) => {
  const { body } = req
  const userId = req.params.userId
  const users = readFile(filePath)
  const usersIds = users.map(user => user.id.toString())
  if (usersIds.includes(userId)) {
    putElemById(users, body, userId, filePath)
  }
  res.send(body)
});

router.get('/db/user_properties', (req, res) => {
  const users = readFile(filePath)
  const cmses = readFile(cmsFilePath)
  const user = req.headers.authorization.substring(7)
  const username = decode(user).user_name
  const userId = users.find(user => user.username === username).id
  const fullUser = users.find(user => user.username === username)
  const cms = cmses.find(cms => cms.userId === userId)
  const userProperties = cms ? cms.user_properties : defaultUserProperties(fullUser)
  res.send(userProperties)
});

router.post('/db/user_properties', (req, res) => {
  const { body } = req
  const users = readFile(filePath)
  const cmses = readFile(cmsFilePath)
  const user = req.headers.authorization.substring(7)
  const username = decode(user).user_name
  const userId = users.find(user => user.username === username).id
  const cms = cmses.find(cms => cms.userId === userId)
  if (cms) {
    putElemToCMSById(cmses, body, userId, cmsFilePath)
  } else {
    pushElemToCMS(cmses, body, userId, cmsFilePath)
  }
  res.send(body)
});

module.exports = router;