"use strict";
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
    yield new DB({
        type: 'postgres',
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME,
        ssl: process.env.DB_USE_SSL === 'true' ? {
            cert: (0, fs_1.readFileSync)(`${__dirname}/../${process.env.DB_CERT || 'client-cert.pem'}`, 'utf-8'),
            key: (0, fs_1.readFileSync)(`${__dirname}/../${process.env.DB_KEY || 'client-key.pem'}`, 'utf-8'),
            ca: (0, fs_1.readFileSync)(`${__dirname}/../${process.env.DB_CA || 'server-ca.pem'}`, 'utf-8'),
            rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true'
        } : process.env.USE_PSQL_HEROKU ? {
            rejectUnauthorized: false
        } : false,
        schema: 'public',
        synchronize: false,
        logging: true,
        entities: [`${__dirname}/entities/*.js`],
        subscribers: [`${__dirname}/subscriber/*.js`],
        migrations: [
            `${__dirname}/migrations/*.js`
        ],
        cli: {
            'migrationsDir': 'src/model/migrations'
        },
        namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
    }, BaseModel_1.BaseModel).build();
});
exports.runDB = runDB;
//# sourceMappingURL=index.js.map