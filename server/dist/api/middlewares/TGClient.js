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
exports.TGClient = void 0;
const telegram_1 = require("@mgilangjanuar/telegram");
const sessions_1 = require("@mgilangjanuar/telegram/sessions");
const Constant_1 = require("../../utils/Constant");
function TGClient(req, _, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = new sessions_1.StringSession('');
        req.tg = new telegram_1.TelegramClient(session, Constant_1.TG_CREDS.apiId, Constant_1.TG_CREDS.apiHash, { connectionRetries: Constant_1.CONNECTION_RETRIES, useWSS: false });
        return next();
    });
}
exports.TGClient = TGClient;
//# sourceMappingURL=TGClient.js.map