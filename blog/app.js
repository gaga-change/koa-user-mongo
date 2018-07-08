
const render = require('./lib/render')
const logger = require('koa-logger')
const router = require('koa-router')()
const koaBody = require('koa-body')
const mount = require('koa-mount')
const componentUser = require('../user')
const session = require('koa-session')

const Koa = require('koa')
const app = module.exports = new Koa()

// "database"

const posts = []

// middleware
app.keys = ['junn secret 4']
app.use(session({}, app)) // session

app.use(logger())

app.use(render)

app.use(koaBody())

app.use(mount('/api', componentUser.routes()))

// route definitions

router.get('/', list)
  .get('/post/new', add)
  .get('/post/:id', show)
  .get('/register', register)
  .get('/logout', logout)
  .post('/post', create)

app.use(router.routes())

/**
 * Post listing.
 */

async function list (ctx) {
  let user = ctx.session.user
  if (!user) {
    ctx.redirect('/register')
  } else
    await ctx.render('list', { posts, user })
}

async function register (ctx) {
  await ctx.render('register')
}

async function logout(ctx) {
  ctx.session = null
  await ctx.render('register')
}

/**
 * Show creation form.
 */

async function add (ctx) {
  await ctx.render('new')
}

/**
 * Show post :id.
 */

async function show (ctx) {
  const id = ctx.params.id
  const post = posts[id]
  if (!post) ctx.throw(404, 'invalid post id')
  await ctx.render('show', { post: post })
}

/**
 * Create a post.
 */

async function create (ctx) {
  const post = ctx.request.body
  const id = posts.push(post) - 1
  post.created_at = new Date()
  post.user = ctx.session.user
  post.id = id
  ctx.redirect('/')
}

// listen

if (!module.parent) app.listen(3000, () => console.log(3000))
