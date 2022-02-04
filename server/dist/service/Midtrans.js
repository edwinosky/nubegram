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
exports.Midtrans = void 0;
const axios_1 = __importDefault(require("axios"));
class Midtrans {
    constructor(req = axios_1.default.create({
        auth: {
            username: process.env.MIDTRANS_SERVER_KEY,
            password: ''
        }
    })) {
        this.req = req;
        if (!process.env.MIDTRANS_SERVER_KEY) {
            throw new Error('Please define Midtrans server key first');
        }
    }
    getPaymentLink(user, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user.midtrans_id) {
                throw new Error('Please generate order ID first');
            }
            const { data } = yield this.req.post('https://app.midtrans.com/snap/v1/transactions', {
                transaction_details: {
                    order_id: user.midtrans_id,
                    gross_amount: amount
                },
                customer_details: {
                    first_name: user.name,
                    email: user.email,
                    phone: user.username
                }
            });
            return data;
        });
    }
    getTransactionStatus(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.req.get(`https://api.midtrans.com/v2/${orderId}/status`);
            return data;
        });
    }
}
exports.Midtrans = Midtrans;
//# sourceMappingURL=Midtrans.js.map