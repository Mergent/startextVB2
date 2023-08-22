const express = require('express');

const { readFile, settings } = require("../utils.js");
const { searchByFindbuchRecursivly, findUnitById, searchByIdWithSiblingsRecursivly, parseTreeToResponse, parseTreeToResponseRecursivly } = require('../treeUtils.js');

const filePath = './sufservice/tree.json'
const router = express.Router();

// router.get('/roots', (req, res) => {
//   const tree = readFile(filePath)
//   const params = req.query

//   let searchTree = tree

//   res.send(searchTree)
// });

router.get('/singleRoot', async (req, res) => {
  if (await settings('singleRoot')) res.status(404)
  const tree = readFile(filePath)
  const params = req.query

  let searchTree = tree

  if (params.veraEntity === "ARCHIV") {
    searchTree = [tree.find(archive => archive.id === params.root)]
  }
  if (params.veraEntity === "FINDBUCH") {
    searchTree = searchByFindbuchRecursivly(searchTree, { selectedFindbuchDocumentKey: params.root })
  }
  searchTree = parseTreeToResponse(searchTree)

  res.send(searchTree)
});

router.get('/children', async (req, res) => {
  if (await settings('children')) res.status(404)
  const tree = readFile(filePath)
  const params = req.query

  let searchTree = tree
  if (params.parentDocumentKey) {
    searchTree = findUnitById(tree, params.parentDocumentKey)?.children ?? []
  }
  searchTree = parseTreeToResponse(searchTree)
  
  res.send(searchTree)
});

router.get('/getTreeByDocument', async (req, res) => {
  if (await settings('getTreeByDocument')) res.status(404)
  const tree = readFile(filePath)
  const params = req.query

  let searchTree = tree
  if (params.selectedArchiveDocumentKey) {
    searchTree = [tree.find(archive => archive.id === params.selectedArchiveDocumentKey)]
  }
  if (params.selectedFindbuchDocumentKey) {
    searchTree = searchByFindbuchRecursivly(searchTree, params)
  }
  if (params.selectedDocumentKey) {
    searchTree = searchByIdWithSiblingsRecursivly(searchTree, params.selectedDocumentKey)
  }

  searchTree = parseTreeToResponseRecursivly(searchTree)
  
  res.send(searchTree)
});

module.exports = router;