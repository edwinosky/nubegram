"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
require('dotenv').config({ path: '.env' });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_1 = __importStar(require("express"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const serialize_error_1 = require("serialize-error");
const Sentry = __importStar(require("@sentry/node"));
const Tracing = __importStar(require("@sentry/tracing"));
const api_1 = require("./api");
const model_1 = require("./model");
const Cache_1 = require("./service/Cache");
Cache_1.Redis.connect();
(0, model_1.runDB)();
const app = (0, express_1.default)();
Sentry.init({
    dsn: 'https://9b19fe16a45741798b87cfd3833822b2@o1062116.ingest.sentry.io/6052883',
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
});
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.set('trust proxy', 1);
app.use((0, cors_1.default)({
    credentials: true,
    origin: [
        /.*/
    ]
}));
app.use((0, compression_1.default)());
app.use((0, express_1.json)());
app.use((0, express_1.urlencoded)({ extended: true }));
app.use((0, express_1.raw)());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('tiny'));
const rateLimiter = new rate_limiter_flexible_1.RateLimiterPostgres({
    storeClient: new pg_1.Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
    }),
    points: Number(process.env.RPS) || 20,
    duration: 1,
    tableName: 'rate_limits',
    tableCreated: false
});
app.get('/ping', (_, res) => res.send({ pong: true }));
app.get('/security.txt', (_, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send('Contact: mgilangjanuar+tdsecurity@gmail.com\nPreferred-Languages: en, id');
});
app.use('/api', (req, res, next) => {
    rateLimiter.consume(req.headers['cf-connecting-ip'] || req.ip).then(() => next()).catch(error => {
        if (error.msBeforeNext) {
            return res.status(429).setHeader('retry-after', error.msBeforeNext).send({ error: 'Too many requests', retryAfter: error.msBeforeNext });
        }
        throw error;
    });
}, api_1.API);
app.use(Sentry.Handlers.errorHandler());
app.use((err, _, res, __) => {
    console.error(err);
    return res.status(err.status || 500).send(err.body || { error: 'Something error', details: (0, serialize_error_1.serializeError)(err) });
});
app.use((0, express_1.static)(path_1.default.join(__dirname, '..', '..', 'web', 'build')));
app.use((req, res) => {
    try {
        if (req.headers['accept'] !== 'application/json') {
            return res.sendFile(path_1.default.join(__dirname, '..', '..', 'web', 'build', 'index.html'));
        }
        return res.status(404).send({ error: 'Not found' });
    }
    catch (error) {
        return res.send({ empty: true });
    }
});
app.listen(process.env.PORT || 4000, () => console.log(`Running at :${process.env.PORT || 4000}...`));
console.log((0, express_list_endpoints_1.default)(app));
//# sourceMappingURL=index.js.map