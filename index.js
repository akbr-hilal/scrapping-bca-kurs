require('dotenv').config();
const express = require('express');
const router = require('./src/routes');

const port = process.env.PORT

const app = express();
app.use(express.json());

app.use('/api', router)

app.listen(port, () => {
  console.log(`SERVER RUNNING ON PORT ${port}`)
})

module.exports = app