"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROCESS_RETRY = exports.CONNECTION_RETRIES = exports.COOKIE_AGE = exports.TG_CREDS = void 0;
exports.TG_CREDS = {
    apiId: Number(process.env.TG_API_ID),
    apiHash: process.env.TG_API_HASH
};
exports.COOKIE_AGE = 54e6;
exports.CONNECTION_RETRIES = 10;
exports.PROCESS_RETRY = 50;
//# sourceMappingURL=Constant.js.map