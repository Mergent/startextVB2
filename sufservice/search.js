const express = require('express');
const decode = require('jwt-decode')

const { createElem, deleteByIds, filterSort, paginationSort, putElemById, addElemOnArrayWithId, pushElem, readFile, settings, filteredAndPaginationSort } = require("../utils.js");
const { searchInTreeByTitle, findUnitById, parseDocumentsToResponse, searchByTitleRecursivly, countAllChildren, searchByFindbuchRecursivly, parseTreeToResponse } = require('../treeUtils.js');

const filePath = './sufservice/tree.json'
const settingsFilePath = './settings/data.json'
const router = express.Router();

router.get('/autocomplete', async (req, res) => {
  if (await settings('autocomplete')) res.status(404)
  const tree = readFile(filePath)
  const { input } = req.query
  const titles = searchInTreeByTitle(tree, input)
  res.send(titles.filter((v, i, a) => a.indexOf(v) === i))
});

router.get('/keyword', async (req, res) => {
  if (await settings('keyword')) res.status(404)

  const tree = readFile(filePath)
  const params = req.query

  let searchTree = tree
  if (params.selectedArchiveDocumentKey) {
    searchTree = [tree.find(archive => archive.id === params.selectedArchiveDocumentKey)]
  }
  if (params.selectedFindbuchDocumentKey) {
    searchTree = searchByFindbuchRecursivly(searchTree, params)
  }

  if (params.keyword) {
    searchTree = searchByTitleRecursivly(searchTree, params)
  }

  let documents = searchInTreeByTitle(searchTree, '')

  if (params.selectedDocumentKey) {
    const unit = findUnitById(searchTree, params.selectedDocumentKey)
    documents = searchInTreeByTitle([unit], '')
    searchTree = unit?.children ?? []
  }

  if (params.selectedFindbuchDocumentKey) documents = documents.filter(document => document.type.value !== "ARCHIV" && document.type.value !== "TEKTONIK")
  if (params.keyword) {
    function highligthString(str, find) {
      if (!str) return str
      const reg = new RegExp(`(${find})`, 'gi');
      return str.replace(reg, '<mark>$1</mark>');
    }
    documents = documents
      .filter(document => document.title.toLowerCase().includes(params.keyword.toLowerCase())
        || document.laufzeit?.toLowerCase().includes(params.keyword.toLowerCase())
        || document.scopeContent?.toLowerCase().includes(params.keyword.toLowerCase())
        || document.signatur?.toLowerCase().includes(params.keyword.toLowerCase())
        || document.corpName?.toLowerCase().includes(params.keyword.toLowerCase())
      )
      .map(document => ({
        ...document,
        title: highligthString(document.title, params.keyword.toLowerCase()),
        laufzeit: highligthString(document.laufzeit, params.keyword.toLowerCase()),
        scopeContent: highligthString(document.scopeContent, params.keyword.toLowerCase()),
        signatur: highligthString(document.signatur, params.keyword.toLowerCase()),
        corpName: highligthString(document.corpName, params.keyword.toLowerCase()),
      }))
  }
  if (params.onlyFindbuecher === 'true') documents = documents.filter(document => document.type.value === "FINDBUCH")
  if (params.onlyVerzeichnungseinheitenVorgaenge === 'true') documents = documents.filter(document => document.type.value === "VERZEICHNUNGSEINHEIT")
  if (params.onlyWithDigitalisat === 'true') documents = documents.filter(document => document.hasOwnProperty('digitalisat') || document.hasOwnProperty('daogrpDaolocHrefs'))
  if (params.laufzeitFrom || params.laufzeitTo) {
    documents = documents.filter(document => {
      const isHigherThenFrom = parseInt(document.unitDate?.split(" - ")[1]) >= (parseInt(params.laufzeitFrom?.split('.')[2] ?? "1900"))
      const isAboveThenTo = parseInt(document.unitDate?.split(" - ")[0]) <= (parseInt(params.laufzeitTo?.split('.')[2] ?? "2100"))
      return isHigherThenFrom && isAboveThenTo
    })
  }

  documents = parseDocumentsToResponse(documents)
  countAllChildren(searchTree)
  searchTree = parseTreeToResponse(searchTree)

  res.send({
    ...filteredAndPaginationSort(documents, params),
    tree: searchTree
  })
});

const parseUnitToDetailsResponse = (unit) => {
  return {
    veraEntity: unit.type.value,
    archivDocumentTitle: unit.corpName,
    compoundSign: unit.signatur,
    title: unit.invisible ? "The title can not be displayed for legal reasons" : unit.title,
    dockey: unit.id,
    metadata: unit.metadata ?? [],
    invisible: unit.invisible ?? false,
    unorderable: unit.unorderable ?? false,
    urlViewer: unit.longLink ?? null,
    hasDips: unit.hasDips ?? true,
    hasMets: unit.hasMets ?? true,
    hasLockChildren: unit.hasLockChildren ?? false,
  }
}

router.get('/details', async (req, res) => {
  if (await settings('sufServiceDetails')) res.status(404)
  const tree = readFile(filePath)
  const { dockey } = req.query
  const unit = findUnitById(tree, dockey)
  const parseUnit = parseUnitToDetailsResponse(unit)
  res.send(parseUnit)
});

module.exports = router;