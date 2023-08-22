const express = require('express');
const decode = require('jwt-decode')

const { readFile } = require("../utils.js");

const filePath = './divisions/data.json'
const usersFilePath = './users/data.json'
const router = express.Router();

router.get('/location', (req, res) => {
  const users = readFile(usersFilePath)
  const user = req.headers.authorization.substring(7)
  const username = decode(user).user_name
  const findUser = users.find(user => user.username === username)
  console.log("LOG -> router.get -> findUser:", findUser)
  const divisions = readFile(filePath)
  res.send(divisions[0])
});

module.exports = router;