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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class Redis {
    constructor() {
        this.redis = new ioredis_1.default(process.env.REDIS_URI);
    }
    static connect() {
        if (!this.client) {
            this.client = new Redis();
        }
        return this.client;
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.redis.get(key);
            if (!result)
                return null;
            try {
                return JSON.parse(result);
            }
            catch (error) {
                return result;
            }
        });
    }
    set(key, data, ex) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (ex) {
                    return (yield this.redis.set(key, JSON.stringify(data), 'EX', ex)) === 'OK';
                }
                else {
                    return (yield this.redis.set(key, JSON.stringify(data))) === 'OK';
                }
            }
            catch (error) {
                if (ex) {
                    return (yield this.redis.set(key, data, 'EX', ex)) === 'OK';
                }
                else {
                    return (yield this.redis.set(key, data)) === 'OK';
                }
            }
        });
    }
    getFromCacheFirst(key, fn, ex) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.get(key);
            if (result)
                return result;
            const data = yield fn();
            yield this.set(key, data, ex);
            return data;
        });
    }
}
exports.Redis = Redis;
//# sourceMappingURL=Cache.js.map