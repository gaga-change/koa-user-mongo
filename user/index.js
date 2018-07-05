/**
 * 协议：
 *  登入
 *  注册
 *  退出
 *  获取当前登入用户
 * 对外插件
 *  权限校验
 *  提前当前用户绑定到 state.user 中
 */

const Koa = require('koa')
const only = require('only')
const Router = require('koa-router')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const session = require('koa-session')

const app = module.exports = new Koa()
const router = new Router()
const users = []

app.keys = ['junn secret 4']

app.use(session({}, app)) // session

router.post('/register', register)
    .post('/login', login)
    .get('/user', currentUser)
    .get('/logout', logout)
    .get('/', userList)

if (!module.parent) {
    app.use(logger())
    app.use(koaBody())
}

app.use(router.routes())

/**
 * 获取当前用户
 */
async function currentUser (ctx) {
    let user = ctx.session.user
    ctx.body = user || {}
}

/**
 * 获取用户列表
 */
async function userList (ctx) {
    ctx.body = users.map(user => {
        return {
            username: user.username,
            id: user.id
        }
    })
}

/**
 * 注册
 * 提供两个参数： username(用户名) password(密码)
 */
async function register (ctx) {
    let user = ctx.request.body
    user = only(user, 'username password')
    if (users.some(item => item.username == user.username)) {
        return ctx.body = { err: '用户名已存在' }
    }
    user.id = users.unshift(user) - 1
    user = only(user, 'username id')
    ctx.body = ctx.session.user = user
}

/**
 * 登入
 * 提供两个参数： username(用户名) password(密码)
 */
async function login (ctx) {
    let user = ctx.request.body
    user = only(user, 'username password')
    let findUser = null
    users.forEach(item => {
        if (item.username == user.username) findUser = item
    })
    if (findUser) {
        if (findUser.password == user.password) {
            ctx.body = ctx.session.user = only(findUser, 'username id')
        } else {
            ctx.body = { err: '密码错误' }
        }
    } else {
        ctx.body = { err: '用户名不存在' }
    }
}

/**
 * 退出
 */
async function logout (ctx) {
    ctx.session = null
    ctx.body = {}
}

app.listen(3000, () => console.log(3000))