"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const teledrive_client_1 = require("teledrive-client");
const Files_1 = require("../../model/entities/Files");
const Usages_1 = require("../../model/entities/Usages");
const Users_1 = require("../../model/entities/Users");
const Cache_1 = require("../../service/Cache");
const FilterQuery_1 = require("../../utils/FilterQuery");
const StringParser_1 = require("../../utils/StringParser");
const Endpoint_1 = require("../base/Endpoint");
const Auth_1 = require("../middlewares/Auth");
const Key_1 = require("../middlewares/Key");
let Users = class Users {
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, limit } = req.query;
            if (!username) {
                throw { status: 400, body: { error: 'Username is required' } };
            }
            const data = yield req.tg.invoke(new teledrive_client_1.Api.contacts.Search({
                q: username,
                limit: Number(limit) || 10
            }));
            return res.send({ users: data.users });
        });
    }
    usage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let usage = yield Usages_1.Usages.findOne({ where: { key: req.user ? `u:${req.user.id}` : `ip:${req.headers['cf-connecting-ip'] || req.ip}` } });
            if (!usage) {
                usage = new Usages_1.Usages();
                usage.key = req.user ? `u:${req.user.id}` : `ip:${req.headers['cf-connecting-ip'] || req.ip}`;
                usage.usage = '0';
                usage.expire = (0, moment_1.default)().add(1, 'day').toDate();
                yield usage.save();
            }
            if (new Date().getTime() - new Date(usage.expire).getTime() > 0) {
                usage.expire = (0, moment_1.default)().add(1, 'day').toDate();
                usage.usage = '0';
                yield usage.save();
            }
            return res.send({ usage });
        });
    }
    find(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = req.query, { sort, offset, limit, search } = _a, filters = __rest(_a, ["sort", "offset", "limit", "search"]);
            const [users, length] = yield Users_1.Users.createQueryBuilder('users')
                .select(req.user.role === 'admin' ? ['users.id', 'users.username', 'users.name', 'users.role', 'users.created_at'] : ['users.username'])
                .where(search ? `username ilike '%${search}%' or name ilike '%${search}%'` : (0, FilterQuery_1.buildWhereQuery)(filters) || 'true')
                .skip(Number(offset) || undefined)
                .take(Number(limit) || undefined)
                .orderBy((0, FilterQuery_1.buildSort)(sort))
                .getManyAndCount();
            return res.send({ users, length });
        });
    }
    settings(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { settings } = req.body;
            req.user.settings = Object.assign(Object.assign({}, req.user.settings || {}), settings);
            yield Users_1.Users.update(req.user.id, req.user);
            yield Cache_1.Redis.connect().del(`auth:${req.authKey}`);
            return res.send({ settings: (_a = req.user) === null || _a === void 0 ? void 0 : _a.settings });
        });
    }
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { reason, agreement } = req.body;
            if (agreement !== 'permanently removed') {
                throw { status: 400, body: { error: 'Invalid agreement' } };
            }
            if (reason && process.env.TG_BOT_TOKEN && process.env.TG_BOT_OWNER_ID) {
                yield axios_1.default.post(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
                    chat_id: process.env.TG_BOT_OWNER_ID,
                    parse_mode: 'Markdown',
                    text: `😭 ${(0, StringParser_1.markdownSafe)(req.user.name)} (@${(0, StringParser_1.markdownSafe)(req.user.username)}) removed their account.\n\nReason: ${(0, StringParser_1.markdownSafe)(reason)}\n\nfrom: \`${(0, StringParser_1.markdownSafe)(req.headers['cf-connecting-ip'] || req.ip)}\`\ndomain: \`${req.headers['authority'] || req.headers.origin}\`${req.user ? `\nplan: ${req.user.plan}${req.user.subscription_id ? `\npaypal: ${req.user.subscription_id}` : ''}${req.user.midtrans_id ? `\nmidtrans: ${req.user.midtrans_id}` : ''}` : ''}`
                });
            }
            yield Files_1.Files.delete({ user_id: req.user.id });
            yield Users_1.Users.delete(req.user.id);
            const success = yield req.tg.invoke(new teledrive_client_1.Api.auth.LogOut());
            return res.clearCookie('authorization').clearCookie('refreshToken').send({ success });
        });
    }
    paymentSync(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            try {
                const { data } = yield axios_1.default.get(`https://teledriveapp.com/api/v1/users/${req.user.tg_id}/payment`, {
                    headers: { token: process.env.UTILS_API_KEY }
                });
                if (data.payment.plan && data.payment.plan !== 'free') {
                    result = data.payment;
                }
            }
            catch (error) {
            }
            if (!result) {
                try {
                    const { data } = yield axios_1.default.get(`https://us.teledriveapp.com/api/v1/users/${req.user.tg_id}/payment`, {
                        headers: { token: process.env.UTILS_API_KEY }
                    });
                    if (data.payment.plan && data.payment.plan !== 'free') {
                        result = data.payment;
                    }
                }
                catch (error) {
                }
            }
            if (!result) {
                try {
                    const { data } = yield axios_1.default.get(`https://ge.teledriveapp.com/api/v1/users/${req.user.tg_id}/payment`, {
                        headers: { token: process.env.UTILS_API_KEY }
                    });
                    if (data.payment.plan && data.payment.plan !== 'free') {
                        result = data.payment;
                    }
                }
                catch (error) {
                }
            }
            if (result) {
                req.user.subscription_id = result === null || result === void 0 ? void 0 : result.subscription_id;
                req.user.midtrans_id = result === null || result === void 0 ? void 0 : result.midtrans_id;
                req.user.plan = result === null || result === void 0 ? void 0 : result.plan;
                yield Users_1.Users.update(req.user.id, req.user);
                yield Cache_1.Redis.connect().del(`auth:${req.authKey}`);
            }
            return res.status(202).send({ accepted: true });
        });
    }
    payment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tgId } = req.params;
            const user = yield Users_1.Users.findOne({ where: { tg_id: tgId } });
            if (!user) {
                throw { status: 404, body: { error: 'User not found' } };
            }
            return res.send({ payment: {
                    subscription_id: user.subscription_id,
                    midtrans_id: user.midtrans_id,
                    plan: user.plan
                } });
        });
    }
    retrieve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, param } = req.params;
            if (param === 'photo') {
                const file = yield req.tg.downloadProfilePhoto(username, { isBig: false });
                if (!(file === null || file === void 0 ? void 0 : file.length)) {
                    return res.redirect('https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png');
                }
                res.setHeader('Cache-Control', 'public, max-age=604800');
                res.setHeader('ETag', Buffer.from(file).toString('base64').slice(10, 50));
                res.setHeader('Content-Disposition', `inline; filename=${username === 'me' ? req.user.username : username}.jpg`);
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Content-Length', file.length);
                res.write(file);
                return res.end();
            }
            const user = username === 'me' || username === req.user.username ? req.user : yield Users_1.Users.findOne({ where: [
                    { username },
                    { id: username }
                ] });
            if (!user) {
                throw { status: 404, body: { error: 'User not found' } };
            }
            return res.send({ user });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.user.role !== 'admin') {
                throw { status: 403, body: { error: 'You are not allowed to do this' } };
            }
            const { id } = req.params;
            yield Files_1.Files.delete({ user_id: id });
            yield Users_1.Users.delete(id);
            return res.send({});
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.user.role !== 'admin') {
                throw { status: 403, body: { error: 'You are not allowed to do this' } };
            }
            const { id } = req.params;
            const { user } = req.body;
            if (!user) {
                throw { status: 400, body: { error: 'User is required' } };
            }
            yield Users_1.Users.update(id, {
                role: user === null || user === void 0 ? void 0 : user.role
            });
            return res.send({});
        });
    }
};
__decorate([
    Endpoint_1.Endpoint.GET({ middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "search", null);
__decorate([
    Endpoint_1.Endpoint.GET('/me/usage', { middlewares: [Auth_1.AuthMaybe] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "usage", null);
__decorate([
    Endpoint_1.Endpoint.GET('/', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "find", null);
__decorate([
    Endpoint_1.Endpoint.PATCH('/me/settings', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "settings", null);
__decorate([
    Endpoint_1.Endpoint.POST('/me/delete', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "remove", null);
__decorate([
    Endpoint_1.Endpoint.POST('/me/paymentSync', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "paymentSync", null);
__decorate([
    Endpoint_1.Endpoint.GET('/:tgId/payment', { middlewares: [Key_1.AuthKey] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "payment", null);
__decorate([
    Endpoint_1.Endpoint.GET('/:username/:param?', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "retrieve", null);
__decorate([
    Endpoint_1.Endpoint.DELETE('/:id', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "delete", null);
__decorate([
    Endpoint_1.Endpoint.PATCH('/:id', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Users.prototype, "update", null);
Users = __decorate([
    Endpoint_1.Endpoint.API()
], Users);
exports.Users = Users;
//# sourceMappingURL=Users.js.map