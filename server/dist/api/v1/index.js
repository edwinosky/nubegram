"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1 = void 0;
const express_1 = require("express");
const Endpoint_1 = require("../base/Endpoint");
const Auth_1 = require("./Auth");
const Contact_1 = require("./Contact");
const Dialogs_1 = require("./Dialogs");
const Documents_1 = require("./Documents");
const Files_1 = require("./Files");
const Github_1 = require("./Github");
const Messages_1 = require("./Messages");
const Subscriptions_1 = require("./Subscriptions");
const Users_1 = require("./Users");
const Utils_1 = require("./Utils");
const Waitings_1 = require("./Waitings");
exports.V1 = (0, express_1.Router)()
    .use(Endpoint_1.Endpoint.register(Auth_1.Auth, Users_1.Users, Waitings_1.Waitings, Github_1.Github, Files_1.Files, Dialogs_1.Dialogs, Messages_1.Messages, Documents_1.Documents, Contact_1.Contact, Subscriptions_1.Subscriptions, Utils_1.Utils));
//# sourceMappingURL=index.js.map