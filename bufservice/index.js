const express = require('express');
const decode = require('jwt-decode')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { createElem, deleteByIds, filterSort, paginationSort, putElemById, addElemOnArrayWithId, pushElem, readFile, delay, settings, filteredAndPaginationSort, deleteByArchivIds } = require("../utils.js");
const { recursiveSearch } = require('../treeUtils.js');

const filePath = './bufservice/tree.json'
const jobsFilePath = './bufservice/jobs.json'
const divisionsFilePath = './divisions/data.json'
const usersFilePath = './users/data.json'
const router = express.Router();

router.post('/upload', async (req, res) => {
  if (await settings('upload')) res.status(404)
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const { body } = req

  const document = JSON.parse(req.files.file.data)
  const treeArchives = readFile(filePath)

  if (document.xmlType === 'VERA_ARCHIVE') {
    treeArchives.push(document.root)
  } else {
    recursiveSearch(treeArchives, document.id, document.children)
  }
  fs.writeFileSync(filePath, JSON.stringify(treeArchives, null, 2), 'utf-8')

  const jobs = readFile(jobsFilePath)
  const lastId = jobs.sort((a, b) => (a.id > b.id ? -1 : 1))[0]?.id ?? 0

  const job = {
    archivId: document.xmlType === 'VERA_ARCHIVE' ? document.root.id : document.id,
    uploadDate: new Date(),
    division: body.division,
    filename: document.filename,
    findbuchId: document.xmlType === 'VERA_ARCHIVE' ? null : document.id,
    id: lastId + 1,
    info: null,
    jobState: "INITIALIZED",
    jobType: document.jobType,
    xmlType: document.xmlType,
    bestandName: document.bestandName,
    bestandSignatur: document.bestandSignatur,
    findbuchName: document.findbuchName,
    findbuchSignatur: document.findbuchSignatur,
    dips: document.dips,
    mets: document.mets,
    sperren: document.sperren,
    apply: false,
    date: new Date(),
  }

  jobs.push(job)
  fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), 'utf-8')

  res.send(job)

  setTimeout((() => {
    const nextJobs = readFile(jobsFilePath)
    const index = nextJobs.findIndex(i => i.findbuchId === document.id || i.archivId === document.id || i.archivId === document.root?.id)
    nextJobs[index] = {
      ...nextJobs[index],
      jobState: "COMPLETED",
      state: "COMPLETED",
      info: "COMPLETED_SUCCESSFULLY",
    };
    fs.writeFileSync(jobsFilePath, JSON.stringify(nextJobs, null, 2), 'utf-8')
  }), document.delay * 1000)

  // Save xml file =>
  // uploadPath = `${__dirname}/${sampleFile.name}`;
  // sampleFile.mv(uploadPath, (err) => {
  //   if (err)
  //     return res.status(500).send(err);

  //   res.send('File uploaded!');
  // });

  // res.send('File uploaded!')
});

router.get('/jobs', async (req, res) => {
  if (await settings('jobs')) res.status(404)
  const params = req.query
  const jobs = readFile(jobsFilePath)
  const applyJobs = jobs.filter(job => !job.apply && job.division === params.division)
  res.send(filteredAndPaginationSort(applyJobs, params))
});

router.post('/publish', async (req, res) => {
  if (await settings('publish')) res.status(404)
  const { body } = req

  const jobs = readFile(jobsFilePath)
  for (const id of body) {
    const index = jobs.findIndex(job => job.id.toString() === id.toString())
    jobs[index] = { ...jobs[index], apply: true, state: "PUBLISHED"};
  }
  fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), 'utf-8')

  res.send({})
});

router.get('/findbuchOverview', async (req, res) => {
  if (await settings('findbuchOverview')) res.status(404)
  const params = req.query
  const jobs = readFile(jobsFilePath)
  const applyJobs = jobs.filter(job => job.apply && job.division === params.division).map(findbook => ({ ...findbook, id: findbook.archivId }))
  res.send(filteredAndPaginationSort(applyJobs, params))
});

router.delete('/jobs', async (req, res) => {
  if (await settings('deleteJobs')) res.status(404)
  const { body } = req
  const jobs = readFile(jobsFilePath)
  const archiveIds = []
  for (const id of body) {
    const archiveId = jobs.find(job => job.id = id).archivId
    archiveIds.push(archiveId)
  }
  
  deleteByIds(jobs, body, jobsFilePath)
  const treeArchives = readFile(filePath)
  for (const id of archiveIds) {
    recursiveSearch(treeArchives, id, [])
  }
  fs.writeFileSync(filePath, JSON.stringify(treeArchives, null, 2), 'utf-8')

  res.send({})
});

router.delete('/delete/findbuecher', async (req, res) => {
  if (await settings('deleteFindbuchOverview')) res.status(404)
  const { body } = req
  const jobs = readFile(jobsFilePath)
  const archiveIds = []
  for (const id of body) {
    const archiveId = jobs.find(job => job.archivId === id).archivId
    archiveIds.push(archiveId)
  }
  
  deleteByArchivIds(jobs, body, jobsFilePath)
  const treeArchives = readFile(filePath)
  for (const id of archiveIds) {
    recursiveSearch(treeArchives, id, [])
  }
  fs.writeFileSync(filePath, JSON.stringify(treeArchives, null, 2), 'utf-8')

  res.send({})
});

router.get('/location', async (req, res) => {
  if (await settings('location')) res.status(404)
  const users = readFile(usersFilePath)
  const user = req.headers.authorization.substring(7)
  const username = decode(user).user_name
  const findUser = users.find(user => user.username === username)
  const divisions = readFile(divisionsFilePath)
  const findDivision = divisions.find(division => division.id === findUser.division)
  if (!findDivision) res.status(404)
  res.send(findDivision)
});

module.exports = router;