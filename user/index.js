/**
 * 协议：
 *  登入
 *  注册
 *  退出
 *  获取当前登入用户
 * 对外插件
 *  权限校验
 *  提前当前用户绑定到 state.user 中
 * 
 * 需
 *  koa-session
 *  koa-body
 */

const only = require('only')
const axios = require('axios')
const Router = require('koa-router')

const router = new Router()
const users = []

exports.routes = ({ base = '/u' } = {}) => {
    router
        .post(base + '/register', register)
        .post(base + '/login', login)
        .get(base + '/user', currentUser)
        .get(base + '/logout', logout)
        .get(base + '/users', userList)
        .get('/github_callback', githubCallback)
    return router.routes()
}

/**
 * github 第三方登入
 */
const client_id = '274df6a3dc60b0dd834c'
const client_secret = 'e8dfc09c2a5544087f4fc01c646d3f57b302e0f5'
async function githubCallback(ctx) {
    let code = ctx.query.code
    let { data: tokenStr } = await axios.post('https://github.com/login/oauth/access_token', {
        client_id,
        client_secret,
        code,
    })
    let { data: githubUser } = await axios.get('https://api.github.com/user?' + tokenStr)
    ctx.body = githubUser
}

/**
 * 获取当前用户
 */
async function currentUser(ctx) {
    let user = ctx.session.user
    ctx.body = user || {}
}

/**
 * 获取用户列表
 */
async function userList(ctx) {
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
async function register(ctx) {
    let user = ctx.request.body
    user = only(user, 'username password')
    if (!user.username || !user.password) ctx.throw(400, 'username&password required', { user })
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
async function login(ctx) {
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
async function logout(ctx) {
    ctx.session = null
    ctx.body = {}
}
