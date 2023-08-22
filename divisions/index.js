const { filterSort, paginationSort, readFile, settings } = require("../utils.js");

const express = require('express');
const fs = require('fs');

const router = express.Router();

const filePath = './divisions/data.json'

router.get('/divisions', async (req, res) => {
  if (await settings('divisions')) res.status(404)
  const divisions = readFile(filePath)
  res.send(divisions)
});
  
module.exports = router;