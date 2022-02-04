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
const telegram_1 = require("@mgilangjanuar/telegram");
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const Files_1 = require("../../model/entities/Files");
const Usages_1 = require("../../model/entities/Usages");
const Users_1 = require("../../model/entities/Users");
const Cache_1 = require("../../service/Cache");
const Midtrans_1 = require("../../service/Midtrans");
const PayPal_1 = require("../../service/PayPal");
const FilterQuery_1 = require("../../utils/FilterQuery");
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
            const data = yield req.tg.invoke(new telegram_1.Api.contacts.Search({
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
            const _a = req.query, { sort, offset, limit } = _a, filters = __rest(_a, ["sort", "offset", "limit"]);
            const [users, length] = yield Users_1.Users.createQueryBuilder('users')
                .select('users.username')
                .where((0, FilterQuery_1.buildWhereQuery)(filters) || 'true')
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
            if (settings.theme === 'dark' && (!req.user.plan || req.user.plan === 'free') && (0, moment_1.default)().format('l') !== '2/2/2022') {
                throw { status: 402, body: { error: 'You need to upgrade your plan to use dark theme' } };
            }
            req.user.settings = Object.assign(Object.assign({}, req.user.settings || {}), settings);
            yield req.user.save();
            return res.send({ settings: (_a = req.user) === null || _a === void 0 ? void 0 : _a.settings });
        });
    }
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { reason, agreement } = req.body;
            if (agreement !== 'permanently removed') {
                throw { status: 400, body: { error: 'Invalid agreement' } };
            }
            if (reason) {
                yield axios_1.default.post(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
                    chat_id: process.env.TG_BOT_OWNER_ID,
                    text: `😭 ${req.user.name} (@${req.user.username}) removed their account.\n\nReason: ${reason}`
                });
            }
            yield Files_1.Files.delete({ user_id: req.user.id });
            yield req.user.remove();
            const success = yield req.tg.invoke(new telegram_1.Api.auth.LogOut());
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
                yield req.user.save();
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
        var _a, _b;
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
            if (username === 'me' || username === req.user.username) {
                const username = req.userAuth.username || req.userAuth.phone;
                let paymentDetails = null, midtransPaymentDetails = null;
                if (req.user.subscription_id) {
                    try {
                        paymentDetails = yield Cache_1.Redis.connect().getFromCacheFirst(`paypal:subscription:${req.user.subscription_id}`, () => __awaiter(this, void 0, void 0, function* () { return yield new PayPal_1.PayPal().getSubscription(req.user.subscription_id); }), 600);
                    }
                    catch (error) {
                    }
                }
                if (req.user.midtrans_id) {
                    try {
                        midtransPaymentDetails = yield Cache_1.Redis.connect().getFromCacheFirst(`midtrans:transaction:${req.user.midtrans_id}`, () => __awaiter(this, void 0, void 0, function* () { return yield new Midtrans_1.Midtrans().getTransactionStatus(req.user.midtrans_id); }), 600);
                        if (!(midtransPaymentDetails === null || midtransPaymentDetails === void 0 ? void 0 : midtransPaymentDetails.transaction_status)) {
                            midtransPaymentDetails = null;
                        }
                    }
                    catch (error) {
                    }
                }
                let plan = 'free';
                if (paymentDetails && paymentDetails.plan_id === process.env.PAYPAL_PLAN_PREMIUM_ID) {
                    const isExpired = new Date().getTime() - new Date((_a = paymentDetails.billing_info) === null || _a === void 0 ? void 0 : _a.last_payment.time).getTime() > 3.154e+10;
                    if (((_b = paymentDetails.billing_info) === null || _b === void 0 ? void 0 : _b.last_payment) && !isExpired || ['APPROVED', 'ACTIVE'].includes(paymentDetails.status)) {
                        plan = 'premium';
                    }
                }
                if (midtransPaymentDetails && (midtransPaymentDetails.settlement_time || midtransPaymentDetails.transaction_time)) {
                    const isExpired = new Date().getTime() - new Date(midtransPaymentDetails.settlement_time || midtransPaymentDetails.transaction_time).getTime() > 3.154e+10;
                    if (['settlement', 'capture'].includes(midtransPaymentDetails.transaction_status) && !isExpired) {
                        plan = 'premium';
                    }
                }
                req.user.plan = plan;
                req.user.username = username;
                req.user.name = `${req.userAuth.firstName || ''} ${req.userAuth.lastName || ''}`.trim() || username;
                if (plan === 'free' && new Date().getTime() - req.user.updated_at.getTime() > 2.592e+8) {
                    req.user.subscription_id = null;
                    req.user.midtrans_id = null;
                }
                yield req.user.save();
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
Users = __decorate([
    Endpoint_1.Endpoint.API()
], Users);
exports.Users = Users;
//# sourceMappingURL=Users.js.map