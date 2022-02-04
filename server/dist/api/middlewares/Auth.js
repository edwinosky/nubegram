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
exports.AuthMaybe = exports.Auth = void 0;
const telegram_1 = require("@mgilangjanuar/telegram");
const sessions_1 = require("@mgilangjanuar/telegram/sessions");
const jsonwebtoken_1 = require("jsonwebtoken");
const Users_1 = require("../../model/entities/Users");
const Constant_1 = require("../../utils/Constant");
function Auth(req, _, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const authkey = (_a = (req.headers.authorization || req.cookies.authorization)) === null || _a === void 0 ? void 0 : _a.replace(/^Bearer\ /gi, '');
        if (!authkey) {
            throw { status: 401, body: { error: 'Auth key is required' } };
        }
        let data;
        try {
            data = (0, jsonwebtoken_1.verify)(authkey, process.env.API_JWT_SECRET);
        }
        catch (error) {
            throw { status: 401, body: { error: 'Access token is invalid' } };
        }
        try {
            const session = new sessions_1.StringSession(data.session);
            req.tg = new telegram_1.TelegramClient(session, Constant_1.TG_CREDS.apiId, Constant_1.TG_CREDS.apiHash, { connectionRetries: Constant_1.CONNECTION_RETRIES, useWSS: false });
        }
        catch (error) {
            throw { status: 401, body: { error: 'Invalid key' } };
        }
        let userAuth;
        try {
            yield req.tg.connect();
            userAuth = yield req.tg.getMe();
        }
        catch (error) {
            try {
                yield new Promise((resolve) => setTimeout(resolve, 2000));
                yield req.tg.connect();
                userAuth = yield req.tg.getMe();
            }
            catch (error) {
                yield new Promise((resolve) => setTimeout(resolve, 2000));
                yield req.tg.connect();
                userAuth = yield req.tg.getMe();
            }
        }
        const user = yield Users_1.Users.findOne({ tg_id: userAuth['id'].toString() });
        if (!user) {
            throw { status: 401, body: { error: 'User not found' } };
        }
        req.user = user;
        req.userAuth = userAuth;
        return next();
    });
}
exports.Auth = Auth;
function AuthMaybe(req, _, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const authkey = (_a = (req.headers.authorization || req.cookies.authorization)) === null || _a === void 0 ? void 0 : _a.replace(/^Bearer\ /gi, '');
        if (authkey) {
            let data;
            try {
                data = (0, jsonwebtoken_1.verify)(authkey, process.env.API_JWT_SECRET);
            }
            catch (error) {
                throw { status: 401, body: { error: 'Access token is invalid' } };
            }
            try {
                const session = new sessions_1.StringSession(data.session);
                req.tg = new telegram_1.TelegramClient(session, Constant_1.TG_CREDS.apiId, Constant_1.TG_CREDS.apiHash, { connectionRetries: Constant_1.CONNECTION_RETRIES, useWSS: false });
            }
            catch (error) {
                throw { status: 401, body: { error: 'Invalid key' } };
            }
            yield req.tg.connect();
            let userAuth;
            try {
                yield req.tg.connect();
                userAuth = yield req.tg.getMe();
            }
            catch (error) {
                try {
                    yield new Promise((resolve) => setTimeout(resolve, 2000));
                    yield req.tg.connect();
                    userAuth = yield req.tg.getMe();
                }
                catch (error) {
                    yield new Promise((resolve) => setTimeout(resolve, 2000));
                    yield req.tg.connect();
                    userAuth = yield req.tg.getMe();
                }
            }
            const user = yield Users_1.Users.findOne({ tg_id: userAuth['id'].toString() });
            if (!user) {
                throw { status: 401, body: { error: 'User not found' } };
            }
            req.user = user;
            req.userAuth = userAuth;
        }
        return next();
    });
}
exports.AuthMaybe = AuthMaybe;
//# sourceMappingURL=Auth.js.map