const express = require('express');
const decode = require('jwt-decode')
const fs = require('fs');

const { createElem, deleteByIds, filterSort, paginationSort, putElemById, addElemOnArrayWithId, pushElem, readFile } = require("../utils.js")

const settingsFilePath = './settings/data.json'
const router = express.Router();

router.get('/endpoints', (req, res) => {
  const endpoints = readFile(settingsFilePath)
  res.send(endpoints)
});

router.post('/endpoints', (req, res) => {
  const { body } = req
  fs.writeFileSync(settingsFilePath, JSON.stringify(body, null, 2), 'utf-8')
  res.send(body.settings)
});

module.exports = router;