const express = require('express')
const fileUpload = require('express-fileupload');
const app = express()
const port = 6100

const cors = require('cors');
app.use(cors())

app.use(fileUpload())

app.use(express.json() );       // to support JSON-encoded bodies
app.use(express.urlencoded());

var users = require('./users');
app.use('/userservice', users)

var roles = require('./roles');
app.use('/userservice', roles)

var auth = require('./auth');
app.use('/auth', auth)

var authDrupal = require('./auth/authDrupal');
app.use('/authservice-drupal', authDrupal)

const divisions = require('./divisions');
app.use('/bufservice', divisions);

app.use('/bufservice', require('./bufservice'))
app.use('/bufservice/preview', require('./bufservice/preview'))

app.use('/sufservice', require('./sufservice'))
app.use('/sufservice/search', require('./sufservice/search'))
app.use('/sufservice/search/tree', require('./sufservice/tree'))
app.use('/sufservice/filter', require('./sufservice/filters'))

app.use('/ConfigService-rest', require('./configservice'))
app.use('/settings', require('./settings'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

