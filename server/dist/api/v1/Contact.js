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
exports.Contact = void 0;
const axios_1 = __importDefault(require("axios"));
const Users_1 = require("../../model/entities/Users");
const Endpoint_1 = require("../base/Endpoint");
let Contact = class Contact {
    send(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, message } = req.body;
            const user = yield Users_1.Users.createQueryBuilder('users').select(['users.subscription_id', 'users.midtrans_id', 'users.plan']).where({ username: from }).getOne();
            yield axios_1.default.post(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
                chat_id: process.env.TG_BOT_OWNER_ID,
                text: `🛎 @${from} wants to contact you!\n\n${message}\n\nfrom: \`${req.headers['cf-connecting-ip'] || req.ip}\` \`${req.headers['authority'] || req.headers.origin}\`${user ? `\nplan: ${user.plan}${user.subscription_id ? `\npaypal: ${user.subscription_id}` : ''}${user.midtrans_id ? `\nmidtrans: ${user.midtrans_id}` : ''}` : ''}`,
                parse_mode: 'Markdown'
            });
            return res.send({ success: true });
        });
    }
};
__decorate([
    Endpoint_1.Endpoint.POST(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Contact.prototype, "send", null);
Contact = __decorate([
    Endpoint_1.Endpoint.API()
], Contact);
exports.Contact = Contact;
//# sourceMappingURL=Contact.js.map