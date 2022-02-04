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
exports.PayPal = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
class PayPal {
    constructor(req = axios_1.default.create({
        baseURL: 'https://api-m.paypal.com/v1'
    }), accessToken) {
        this.req = req;
        this.accessToken = accessToken;
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
                throw new Error('Please define PayPal credentials first');
            }
            const { data } = yield this.req.post('/oauth2/token', qs_1.default.stringify({
                grant_type: 'client_credentials'
            }), {
                auth: {
                    username: process.env.PAYPAL_CLIENT_ID,
                    password: process.env.PAYPAL_CLIENT_SECRET
                }
            });
            this.accessToken = data.access_token;
            return data;
        });
    }
    createSubscription(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.PAYPAL_PLAN_PREMIUM_ID) {
                throw new Error('Please define PayPal plan ID first');
            }
            const hit = () => __awaiter(this, void 0, void 0, function* () {
                return yield this.req.post('/billing/subscriptions', {
                    plan_id: process.env.PAYPAL_PLAN_PREMIUM_ID,
                    subscriber: {
                        name: {
                            given_name: user.name,
                            surname: user.username
                        },
                        email_address: user.email
                    }
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
            });
            if (!this.accessToken) {
                yield this.getAccessToken();
            }
            try {
                const { data } = yield hit();
                return data;
            }
            catch (error) {
                yield this.getAccessToken();
                const { data } = yield hit();
                return data;
            }
        });
    }
    getSubscription(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const hit = () => __awaiter(this, void 0, void 0, function* () {
                return yield this.req.get(`/billing/subscriptions/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
            });
            if (!this.accessToken) {
                yield this.getAccessToken();
            }
            try {
                const { data } = yield hit();
                return data;
            }
            catch (error) {
                yield this.getAccessToken();
                const { data } = yield hit();
                return data;
            }
        });
    }
    cancelSubscription(id, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const hit = () => __awaiter(this, void 0, void 0, function* () {
                return yield this.req.post(`/billing/subscriptions/${id}/cancel`, { reason }, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
            });
            if (!this.accessToken) {
                yield this.getAccessToken();
            }
            try {
                const { data } = yield hit();
                return data;
            }
            catch (error) {
                yield this.getAccessToken();
                const { data } = yield hit();
                return data;
            }
        });
    }
}
exports.PayPal = PayPal;
//# sourceMappingURL=PayPal.js.map