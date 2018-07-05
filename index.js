const Koa = require('koa')
const mount = require('koa-mount')
const blogApp = require('./blog/app')

const app = new Koa()

app.use(mount('/', blogApp))

app.listen(3000, () => console.log(3000))

