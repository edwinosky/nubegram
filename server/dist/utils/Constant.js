"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = exports.CONNECTION_RETRIES = exports.COOKIE_AGE = exports.TG_CREDS = void 0;
exports.TG_CREDS = {
    apiId: Number(process.env.TG_API_ID),
    apiHash: process.env.TG_API_HASH
};
exports.COOKIE_AGE = 54e6;
exports.CONNECTION_RETRIES = 10;
exports.PLANS = {
    free: {
        sharedFiles: 3000,
        publicFiles: 1000,
        sharingUsers: 5000
    },
    premium: {
        sharedFiles: 4000,
        publicFiles: 2000,
        sharingUsers: 60000
    },
    business: {
        sharedFiles: Infinity,
        publicFiles: Infinity,
        sharingUsers: Infinity
    }
};
//# sourceMappingURL=Constant.js.map