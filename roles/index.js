const { readFile, filteredAndPaginationSort } = require("../utils.js")

const express = require('express');

const router = express.Router();
const filePath = './roles/data.json'

router.get('/db/roles', (req, res) => {
  const roles = readFile(filePath)
  const params = req.query
  res.send(filteredAndPaginationSort(roles, params))
});

module.exports = router;