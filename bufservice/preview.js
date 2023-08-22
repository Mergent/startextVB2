const express = require('express');

const { readFile, settings } = require("../utils.js");
const { findUnitById, parseTree } = require('../treeUtils.js');

const filePath = './bufservice/tree.json'
const router = express.Router();

router.get('/listRoot', async (req, res) => {
  if (await settings('listRoot')) res.status(404)
  const treeArchives = readFile(filePath)
  res.send(parseTree(treeArchives))
});

router.get('/listSingleRoot', async (req, res) => {
  if (await settings('listSingleRoot')) res.status(404)
  const treeArchives = readFile(filePath)
  const params = req.query
  const tree = findUnitById(treeArchives, params.parentId)
  res.send(parseTree([tree]))
});

router.get('/listChildren', async (req, res) => {
  if (await settings('listChildren')) res.status(404)
  const treeArchives = readFile(filePath)
  const params = req.query
  const tree = findUnitById(treeArchives, params.parentId)
  res.send(parseTree(tree.children))
});

router.get('/detail', async (req, res) => {
  if (await settings('bufServiceDetail')) res.status(404)
  const treeArchives = readFile(filePath)
  const params = req.query
  const tree = findUnitById(treeArchives, params.parentId)

  const noChildrenUnit = {
    ...tree,
    children: tree.veraEntity === "KLASSIFIKATIONSPUNKT" ? tree.children : [],
  }

  res.send(noChildrenUnit)
});

module.exports = router;