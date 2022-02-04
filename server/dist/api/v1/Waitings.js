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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Waitings = void 0;
const typeorm_1 = require("typeorm");
const Waitings_1 = require("../../model/entities/Waitings");
const Endpoint_1 = require("../base/Endpoint");
let Waitings = class Waitings {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            let data = yield Waitings_1.Waitings.findOne({ email });
            if (!data) {
                data = yield (0, typeorm_1.getRepository)(Waitings_1.Waitings).save({ email: email });
            }
            return res.send({ success: true });
        });
    }
};
__decorate([
    Endpoint_1.Endpoint.POST('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Waitings.prototype, "create", null);
Waitings = __decorate([
    Endpoint_1.Endpoint.API()
], Waitings);
exports.Waitings = Waitings;
//# sourceMappingURL=Waitings.js.map