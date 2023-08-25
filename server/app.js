require('dotenv').config({ path: process.env.NODE_ENV.trim() === 'prod' ? '.env.production' : '.env.development' })
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
// const logger = require('morgan')
require('./config/moduleAlias')

const { logger, trace, pushlog } = require('./logs/index')

const utils = require('./utils')
const isHasPermis = require('./utils/isHasPermissions')
const indexRouter = require('./routes/index')
const { getDataScopeWhere } = require('./utils/isDataScope')

const app = express()

require('./service/sequelize').connectAndSyncDatabase().then()
require('./service/seq_chatai').connectAndSyncDatabase().then()

global.log = logger
global.trace = trace
global.pushlog = pushlog
global.$utils = utils
global.$$has = isHasPermis
global.$$dataScope = getDataScopeWhere

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use((req, res, next) => next(logger.info(`${req.method} ${req.url} from ${req.ip}`)))
// app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/public', express.static('public'))

// 如果使用负载 就要设置这个才能使express-rate-limit生效 等用到的时候再搜索 trust proxy设置
app.set('trust proxy', 1)
// catch 404 and forward to error handler
app.use(function (req, res, next) { next(createError(404)) })

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	if (err.name === 'UnauthorizedError') {
		res.status(401).send({ code: 401, msg: '未登录' })
	}

	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
