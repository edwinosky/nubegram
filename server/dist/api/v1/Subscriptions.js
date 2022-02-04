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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriptions = void 0;
const uuid_random_1 = __importDefault(require("uuid-random"));
const Users_1 = require("../../model/entities/Users");
const Midtrans_1 = require("../../service/Midtrans");
const PayPal_1 = require("../../service/PayPal");
const Endpoint_1 = require("../base/Endpoint");
const Auth_1 = require("../middlewares/Auth");
let Subscriptions = class Subscriptions {
    create(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (req.query.provider === 'midtrans') {
                if (req.user.midtrans_id) {
                    try {
                        const result = yield new Midtrans_1.Midtrans().getTransactionStatus(req.user.midtrans_id);
                        const isExpired = new Date().getTime() - new Date(result.settlement_time || result.transaction_time).getTime() > 3.154e+10;
                        if (['settlement', 'capture'].includes(result.transaction_status) && !isExpired) {
                            return res.send({ link: '/dashboard' });
                        }
                    }
                    catch (error) {
                    }
                }
                req.user.midtrans_id = `premium-${(0, uuid_random_1.default)()}`;
                if (req.body.email) {
                    req.user.email = req.body.email;
                }
                yield req.user.save();
                const result = yield new Midtrans_1.Midtrans().getPaymentLink(req.user, 144000);
                return res.send({ link: result.redirect_url });
            }
            if (req.user.subscription_id) {
                try {
                    const result = yield new PayPal_1.PayPal().getSubscription(req.user.subscription_id);
                    const link = (_a = result.links.find(link => link.rel === 'approve')) === null || _a === void 0 ? void 0 : _a.href;
                    return res.send({ link: link || '/dashboard' });
                }
                catch (error) {
                }
            }
            const result = yield new PayPal_1.PayPal().createSubscription(req.user);
            yield Users_1.Users.update(req.user.id, { subscription_id: result.id });
            return res.send({ link: result.links.find(link => link.rel === 'approve').href });
        });
    }
};
__decorate([
    Endpoint_1.Endpoint.POST('/', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Subscriptions.prototype, "create", null);
Subscriptions = __decorate([
    Endpoint_1.Endpoint.API()
], Subscriptions);
exports.Subscriptions = Subscriptions;
//# sourceMappingURL=Subscriptions.js.map