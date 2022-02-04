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
var Files_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Files = void 0;
const typeorm_1 = require("typeorm");
const BaseModel_1 = require("../base/BaseModel");
const Users_1 = require("./Users");
let Files = Files_1 = class Files extends BaseModel_1.BaseModelWithID {
};
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Files.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Files.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Files.prototype, "message_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Files.prototype, "mime_type", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: null }),
    __metadata("design:type", String)
], Files.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: null }),
    __metadata("design:type", Date)
], Files.prototype, "uploaded_at", void 0);
__decorate([
    (0, typeorm_1.Column)('double precision', { default: null }),
    __metadata("design:type", Number)
], Files.prototype, "upload_progress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Files.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Users_1.Users, users => users.files, { onUpdate: 'CASCADE', onDelete: 'CASCADE' }),
    __metadata("design:type", Users_1.Users)
], Files.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Files.prototype, "parent_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Files_1, file => file.children, { onUpdate: 'CASCADE', onDelete: 'CASCADE' }),
    __metadata("design:type", Files)
], Files.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Files_1, file => file.parent),
    __metadata("design:type", Array)
], Files.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Files.prototype, "deleted_at", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { array: true, default: null }),
    __metadata("design:type", Array)
], Files.prototype, "sharing_options", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null, select: false }),
    __metadata("design:type", String)
], Files.prototype, "signed_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null, select: false }),
    __metadata("design:type", String)
], Files.prototype, "file_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Files.prototype, "link_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Files_1, file => file.links, { onUpdate: 'CASCADE', onDelete: 'CASCADE' }),
    __metadata("design:type", Files)
], Files.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Files_1, file => file.link),
    __metadata("design:type", Array)
], Files.prototype, "links", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Files.prototype, "forward_info", void 0);
Files = Files_1 = __decorate([
    (0, typeorm_1.Entity)()
], Files);
exports.Files = Files;
//# sourceMappingURL=Files.js.map