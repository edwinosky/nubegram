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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDB = exports.DB = exports.getRepository = void 0;
const fs_1 = require("fs");
const PostgressConnectionStringParser = __importStar(require("pg-connection-string"));
const typeorm_1 = require("typeorm");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const BaseModel_1 = require("./base/BaseModel");
const getRepository = (entity, connection = 'default') => (0, typeorm_1.getRepository)(entity, connection);
exports.getRepository = getRepository;
class DB {
    constructor(_opts, _BaseModels) {
        this._opts = _opts;
        this._BaseModels = _BaseModels;
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            this._connection = yield (0, typeorm_1.createConnection)(this._opts);
            this._BaseModels.useConnection(this._connection);
        });
    }
}
exports.DB = DB;
const runDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const creds = {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
    };
    if (process.env.DATABASE_URL) {
        const connectionOptions = PostgressConnectionStringParser.parse(process.env.DATABASE_URL);
        creds.host = connectionOptions.host;
        creds.database = connectionOptions.database;
        creds.password = connectionOptions.password;
        creds.port = Number(connectionOptions.port) || 5432;
        creds.username = connectionOptions.user;
    }
    yield new DB(Object.assign(Object.assign({}, creds), { type: 'postgres', ssl: process.env.DB_USE_SSL === 'true' ? {
            cert: (0, fs_1.readFileSync)(`${__dirname}/../${process.env.DB_CERT || 'client-cert.pem'}`, 'utf-8'),
            key: (0, fs_1.readFileSync)(`${__dirname}/../${process.env.DB_KEY || 'client-key.pem'}`, 'utf-8'),
            ca: (0, fs_1.readFileSync)(`${__dirname}/../${process.env.DB_CA || 'server-ca.pem'}`, 'utf-8'),
            rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true'
        } : process.env.USE_PSQL_HEROKU ? {
            rejectUnauthorized: false
        } : false, schema: 'public', synchronize: false, logging: process.env.ENV !== 'production', entities: [`${__dirname}/entities/*.js`], subscribers: [`${__dirname}/subscriber/*.js`], migrations: [
            `${__dirname}/migrations/*.js`
        ], cli: {
            'migrationsDir': 'src/model/migrations'
        }, namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy() }), BaseModel_1.BaseModel).build();
});
exports.runDB = runDB;
//# sourceMappingURL=index.js.map