const express = require('express');

const { readFile, settings } = require("../utils.js");
const { findAllArchives, findAllFindbuches } = require('../treeUtils.js');

const filePath = './sufservice/tree.json'
const router = express.Router();

router.get('/archive', async (req, res) => {
  if (await settings('archive')) res.status(404)
  const tree = readFile(filePath)
  const archives = findAllArchives(tree)
  res.send(archives)
});

router.get('/findbuch', async (req, res) => {
  if (await settings('findbuch')) res.status(404)
  const tree = readFile(filePath)
  const archiveId = req.query.archiveDocumentKey
  const archives = findAllFindbuches(tree, archiveId)
  res.send(archives)
});

module.exports = router;