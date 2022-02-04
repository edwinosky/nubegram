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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var Files_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Files = void 0;
const telegram_1 = require("@mgilangjanuar/telegram");
const sessions_1 = require("@mgilangjanuar/telegram/sessions");
const big_integer_1 = __importDefault(require("big-integer"));
const content_disposition_1 = __importDefault(require("content-disposition"));
const crypto_js_1 = require("crypto-js");
const moment_1 = __importDefault(require("moment"));
const multer_1 = __importDefault(require("multer"));
const Files_2 = require("../../model/entities/Files");
const Usages_1 = require("../../model/entities/Usages");
const Constant_1 = require("../../utils/Constant");
const FilterQuery_1 = require("../../utils/FilterQuery");
const Endpoint_1 = require("../base/Endpoint");
const Auth_1 = require("../middlewares/Auth");
let Files = Files_1 = class Files {
    find(req, res) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const _g = req.query, { sort, offset, limit, shared, exclude_parts: excludeParts, t: _t } = _g, filters = __rest(_g, ["sort", "offset", "limit", "shared", "exclude_parts", "t"]);
            const parent = (filters === null || filters === void 0 ? void 0 : filters.parent_id) ? yield Files_2.Files.findOne(filters.parent_id) : null;
            if ((filters === null || filters === void 0 ? void 0 : filters.parent_id) && !parent) {
                throw { status: 404, body: { error: 'Parent not found' } };
            }
            if (!req.user && !((_a = parent === null || parent === void 0 ? void 0 : parent.sharing_options) === null || _a === void 0 ? void 0 : _a.includes('*'))) {
                throw { status: 404, body: { error: 'Parent not found' } };
            }
            let where = 'files.user_id = :user';
            if (shared) {
                if (((_b = parent === null || parent === void 0 ? void 0 : parent.sharing_options) === null || _b === void 0 ? void 0 : _b.includes((_c = req.user) === null || _c === void 0 ? void 0 : _c.username)) || ((_d = parent === null || parent === void 0 ? void 0 : parent.sharing_options) === null || _d === void 0 ? void 0 : _d.includes('*'))) {
                    where = 'true';
                }
                else {
                    where = ':user = any(files.sharing_options) and (files.parent_id is null or parent.sharing_options is null or cardinality(parent.sharing_options) = 0 or not :user = any(parent.sharing_options))';
                }
            }
            let query = Files_2.Files.createQueryBuilder('files')
                .where(where, {
                user: shared ? (_e = req.user) === null || _e === void 0 ? void 0 : _e.username : (_f = req.user) === null || _f === void 0 ? void 0 : _f.id
            })
                .andWhere((0, FilterQuery_1.buildWhereQuery)(filters, 'files.') || 'true');
            if (excludeParts === 'true' || excludeParts === '1') {
                query = query.andWhere('(files.name ~ \'.part0*1$\' or files.name !~ \'.part[0-9]+$\')');
            }
            if (shared && where !== 'true') {
                query = query.leftJoin('files.parent', 'parent');
            }
            const [files, length] = yield query
                .skip(Number(offset) || 0)
                .take(Number(limit) || 10)
                .orderBy((0, FilterQuery_1.buildSort)(sort, 'files.'))
                .getManyAndCount();
            return res.send({ files, length });
        });
    }
    save(req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const { messageId } = req.query;
            const { file } = req.body;
            if (!file) {
                throw { status: 400, body: { error: 'File is required in body.' } };
            }
            let message = {};
            if (messageId) {
                if (!file.forward_info) {
                    throw { status: 400, body: { error: 'Forward info is required in body.' } };
                }
                let chat;
                if (file.forward_info && file.forward_info.match(/^channel\//gi)) {
                    const [type, peerId, _id, accessHash] = file.forward_info.split('/');
                    let peer;
                    if (type === 'channel') {
                        peer = new telegram_1.Api.InputPeerChannel({
                            channelId: (0, big_integer_1.default)(peerId),
                            accessHash: (0, big_integer_1.default)(accessHash)
                        });
                        chat = yield req.tg.invoke(new telegram_1.Api.channels.GetMessages({
                            channel: peer,
                            id: [new telegram_1.Api.InputMessageID({ id: Number(messageId) })]
                        }));
                    }
                }
                else {
                    chat = (yield req.tg.invoke(new telegram_1.Api.messages.GetMessages({
                        id: [new telegram_1.Api.InputMessageID({ id: Number(messageId) })]
                    })));
                }
                if (!((_a = chat === null || chat === void 0 ? void 0 : chat['messages']) === null || _a === void 0 ? void 0 : _a[0])) {
                    throw { status: 404, body: { error: 'Message not found' } };
                }
                const mimeType = chat['messages'][0].media.photo ? 'image/jpeg' : chat['messages'][0].media.document.mimeType || 'unknown';
                const name = chat['messages'][0].media.photo ? `${chat['messages'][0].media.photo.id}.jpg` : ((_c = (_b = chat['messages'][0].media.document.attributes) === null || _b === void 0 ? void 0 : _b.find((atr) => atr.fileName)) === null || _c === void 0 ? void 0 : _c.fileName) || `${(_d = chat['messages'][0].media) === null || _d === void 0 ? void 0 : _d.document.id}.${mimeType.split('/').pop()}`;
                const getSizes = ({ size, sizes }) => sizes ? sizes.pop() : size;
                const size = chat['messages'][0].media.photo ? getSizes(chat['messages'][0].media.photo.sizes.pop()) : (_e = chat['messages'][0].media.document) === null || _e === void 0 ? void 0 : _e.size;
                let type = chat['messages'][0].media.photo || mimeType.match(/^image/gi) ? 'image' : null;
                if (((_f = chat['messages'][0].media.document) === null || _f === void 0 ? void 0 : _f.mimeType.match(/^video/gi)) || name.match(/\.mp4$/gi) || name.match(/\.mkv$/gi) || name.match(/\.mov$/gi)) {
                    type = 'video';
                }
                else if (((_g = chat['messages'][0].media.document) === null || _g === void 0 ? void 0 : _g.mimeType.match(/pdf$/gi)) || name.match(/\.doc$/gi) || name.match(/\.docx$/gi) || name.match(/\.xls$/gi) || name.match(/\.xlsx$/gi)) {
                    type = 'document';
                }
                else if (((_h = chat['messages'][0].media.document) === null || _h === void 0 ? void 0 : _h.mimeType.match(/audio$/gi)) || name.match(/\.mp3$/gi) || name.match(/\.ogg$/gi)) {
                    type = 'audio';
                }
                message = {
                    name,
                    message_id: chat['messages'][0].id,
                    mime_type: mimeType,
                    size,
                    user_id: req.user.id,
                    uploaded_at: new Date(chat['messages'][0].date * 1000),
                    type
                };
            }
            const { raw } = yield Files_2.Files.createQueryBuilder('files').insert().values(Object.assign(Object.assign({}, file), message)).returning('*').execute();
            return res.send({ file: raw[0] });
        });
    }
    addFolder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { file: data } = req.body;
            const count = (data === null || data === void 0 ? void 0 : data.name) ? null : yield Files_2.Files.createQueryBuilder('files').where(`type = :type and user_id = :userId and name like 'New Folder%' and parent_id ${(data === null || data === void 0 ? void 0 : data.parent_id) ? '= :parentId' : 'is null'}`, {
                type: 'folder',
                userId: req.user.id,
                parentId: data === null || data === void 0 ? void 0 : data.parent_id
            }).getCount();
            const parent = (data === null || data === void 0 ? void 0 : data.parent_id) ? yield Files_2.Files.createQueryBuilder('files')
                .where('id = :id', { id: data.parent_id })
                .addSelect('files.signed_key')
                .getOne() : null;
            const { raw } = yield Files_2.Files.createQueryBuilder('files').insert().values(Object.assign({ name: (data === null || data === void 0 ? void 0 : data.name) || `New Folder${count ? ` (${count})` : ''}`, mime_type: 'teledrive/folder', user_id: req.user.id, type: 'folder', uploaded_at: new Date() }, parent ? {
                parent_id: parent.id,
                sharing_options: parent.sharing_options,
                signed_key: parent.signed_key
            } : {})).returning('*').execute();
            return res.send({ file: raw[0] });
        });
    }
    retrieve(req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const file = yield Files_2.Files.createQueryBuilder('files')
                .where('id = :id', { id })
                .addSelect('files.signed_key')
                .getOne();
            const parent = (file === null || file === void 0 ? void 0 : file.parent_id) ? yield Files_2.Files.createQueryBuilder('files')
                .where('id = :id', { id: file.parent_id })
                .addSelect('files.signed_key')
                .getOne() : null;
            if (!file || file.user_id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) && !((_b = file.sharing_options) === null || _b === void 0 ? void 0 : _b.includes('*')) && !((_c = file.sharing_options) === null || _c === void 0 ? void 0 : _c.includes((_d = req.user) === null || _d === void 0 ? void 0 : _d.username))) {
                if (!((_e = parent === null || parent === void 0 ? void 0 : parent.sharing_options) === null || _e === void 0 ? void 0 : _e.includes((_f = req.user) === null || _f === void 0 ? void 0 : _f.username)) && !((_g = parent === null || parent === void 0 ? void 0 : parent.sharing_options) === null || _g === void 0 ? void 0 : _g.includes('*'))) {
                    throw { status: 404, body: { error: 'File not found' } };
                }
            }
            file.signed_key = file.signed_key || (parent === null || parent === void 0 ? void 0 : parent.signed_key);
            let files = [file];
            if (/.*\.part0*1$/gi.test(file === null || file === void 0 ? void 0 : file.name)) {
                if (((_h = req.user) === null || _h === void 0 ? void 0 : _h.plan) !== 'premium') {
                    throw { status: 402, body: { error: 'Please upgrade your plan for view this file' } };
                }
                files = yield Files_2.Files.createQueryBuilder('files')
                    .where(`(id = :id or name like '${file.name.replace(/\.part0*1$/gi, '')}%') and user_id = :user_id and parent_id ${file.parent_id ? '= :parent_id' : 'is null'}`, {
                    id, user_id: file.user_id, parent_id: file.parent_id
                })
                    .addSelect('files.signed_key')
                    .orderBy('name')
                    .getMany();
                files[0].signed_key = file.signed_key = file.signed_key || (parent === null || parent === void 0 ? void 0 : parent.signed_key);
            }
            if (!req.user || file.user_id !== ((_j = req.user) === null || _j === void 0 ? void 0 : _j.id)) {
                yield Files_1.initiateSessionTG(req, files);
                yield req.tg.connect();
            }
            return yield Files_1.download(req, res, files);
        });
    }
    remove(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { deleteMessage } = req.query;
            const { affected, raw } = yield Files_2.Files.createQueryBuilder('files')
                .delete()
                .where({ id, user_id: req.user.id })
                .returning('*')
                .execute();
            if (!affected) {
                throw { status: 404, body: { error: 'File not found' } };
            }
            const file = raw[0];
            if (deleteMessage && ['true', '1'].includes(deleteMessage) && !(file === null || file === void 0 ? void 0 : file.forward_info)) {
                try {
                    yield req.tg.invoke(new telegram_1.Api.messages.DeleteMessages({ id: [Number(file.message_id)], revoke: true }));
                }
                catch (error) {
                    try {
                        yield req.tg.invoke(new telegram_1.Api.channels.DeleteMessages({ id: [Number(file.message_id)], channel: 'me' }));
                    }
                    catch (error) {
                    }
                }
            }
            if (/.*\.part0*1$/gi.test(file === null || file === void 0 ? void 0 : file.name)) {
                const { raw: files } = yield Files_2.Files.createQueryBuilder('files')
                    .delete()
                    .where(`(id = :id or name like '${file.name.replace(/\.part0*1$/gi, '')}%') and user_id = :user_id and parent_id ${file.parent_id ? '= :parent_id' : 'is null'}`, {
                    id, user_id: file.user_id, parent_id: file.parent_id
                })
                    .returning('*')
                    .execute();
                files.map((file) => __awaiter(this, void 0, void 0, function* () {
                    if (deleteMessage && ['true', '1'].includes(deleteMessage) && !(file === null || file === void 0 ? void 0 : file.forward_info)) {
                        try {
                            yield req.tg.invoke(new telegram_1.Api.messages.DeleteMessages({ id: [Number(file.message_id)], revoke: true }));
                        }
                        catch (error) {
                            try {
                                yield req.tg.invoke(new telegram_1.Api.channels.DeleteMessages({ id: [Number(file.message_id)], channel: 'me' }));
                            }
                            catch (error) {
                            }
                        }
                    }
                }));
            }
            return res.send({ file });
        });
    }
    update(req, res) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { file } = req.body;
            if (!file) {
                throw { status: 400, body: { error: 'File is required in body' } };
            }
            const currentFile = yield Files_2.Files.createQueryBuilder('files')
                .where({ id, user_id: req.user.id })
                .addSelect('files.signed_key')
                .getOne();
            if (!currentFile) {
                throw { status: 404, body: { error: 'File not found' } };
            }
            if (((_a = file.sharing_options) === null || _a === void 0 ? void 0 : _a.length) && currentFile.type === 'folder') {
                if (req.user.plan === 'free' || !req.user.plan) {
                    throw { status: 402, body: { error: 'Payment required' } };
                }
            }
            const parent = file.parent_id ? yield Files_2.Files.createQueryBuilder('files')
                .where('id = :id', { id: file.parent_id })
                .addSelect('files.signed_key')
                .getOne() : null;
            let key = currentFile.signed_key || (parent === null || parent === void 0 ? void 0 : parent.signed_key);
            if (((_b = file.sharing_options) === null || _b === void 0 ? void 0 : _b.length) && !key) {
                key = crypto_js_1.AES.encrypt(JSON.stringify({ file: { id: file.id }, session: req.tg.session.save() }), process.env.FILES_JWT_SECRET).toString();
            }
            if (!((_c = file.sharing_options) === null || _c === void 0 ? void 0 : _c.length) && !((_d = currentFile.sharing_options) === null || _d === void 0 ? void 0 : _d.length) && !((_e = parent === null || parent === void 0 ? void 0 : parent.sharing_options) === null || _e === void 0 ? void 0 : _e.length)) {
                key = null;
            }
            if (/.*\.part0*1$/gi.test(currentFile === null || currentFile === void 0 ? void 0 : currentFile.name)) {
                const files = yield Files_2.Files.createQueryBuilder('files')
                    .where(`(id = :id or name like '${currentFile.name.replace(/\.part0*1$/gi, '')}%') and user_id = :user_id and parent_id ${currentFile.parent_id ? '= :parent_id' : 'is null'}`, {
                    id, user_id: currentFile.user_id, parent_id: currentFile.parent_id
                })
                    .addSelect('files.signed_key')
                    .getMany();
                yield Promise.all(files.map((current) => __awaiter(this, void 0, void 0, function* () {
                    return yield Files_2.Files.createQueryBuilder('files')
                        .update(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, file.name ? { name: current.name.replace(current.name.replace(/\.part0*\d+$/gi, ''), file.name) } : {}), file.sharing_options !== undefined ? { sharing_options: file.sharing_options } : {}), file.parent_id !== undefined ? { parent_id: file.parent_id } : {}), parent && current.type === 'folder' ? {
                        sharing_options: parent.sharing_options
                    } : {}), { signed_key: key }))
                        .where({ id: current.id })
                        .execute();
                })));
            }
            else {
                yield Files_2.Files.createQueryBuilder('files')
                    .update(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, file.name ? { name: currentFile.name.replace(currentFile.name.replace(/\.part0*1$/gi, ''), file.name) } : {}), file.sharing_options !== undefined ? { sharing_options: file.sharing_options } : {}), file.parent_id !== undefined ? { parent_id: file.parent_id } : {}), parent && currentFile.type === 'folder' ? {
                    sharing_options: parent.sharing_options
                } : {}), { signed_key: key }))
                    .where({ id, user_id: req.user.id })
                    .execute();
            }
            if (file.sharing_options !== undefined && currentFile.type === 'folder') {
                const updateSharingOptions = (currentFile) => __awaiter(this, void 0, void 0, function* () {
                    const children = yield Files_2.Files.createQueryBuilder('files')
                        .where('parent_id = :parent_id and type = \'folder\'', { parent_id: currentFile.id })
                        .addSelect('files.signed_key')
                        .getMany();
                    for (const child of children) {
                        yield Files_2.Files.createQueryBuilder('files')
                            .update({ sharing_options: file.sharing_options, signed_key: key || child.signed_key })
                            .where({ id: child.id, user_id: req.user.id })
                            .execute();
                        yield updateSharingOptions(child);
                    }
                });
                yield updateSharingOptions(currentFile);
            }
            return res.send({ file: { id } });
        });
    }
    upload(req, res) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const { name, size, mime_type: mimetype, parent_id: parentId, total_part: totalPart, part } = req.query;
            if (!name || !size || !mimetype || !part || !totalPart) {
                throw { status: 400, body: { error: 'Name, size, mimetype, part, and total part are required' } };
            }
            const file = req.file;
            if (!file) {
                throw { status: 400, body: { error: 'File upload is required' } };
            }
            if (file.size > 512 * 1024) {
                throw { status: 400, body: { error: 'Maximum file part size is 500kB' } };
            }
            if ((!((_a = req.user) === null || _a === void 0 ? void 0 : _a.plan) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.plan) === 'free') && /\.part\d+$/gi.test(name)) {
                throw { status: 402, body: { error: 'Payment required' } };
            }
            let model;
            if ((_c = req.params) === null || _c === void 0 ? void 0 : _c.id) {
                model = yield Files_2.Files.createQueryBuilder('files')
                    .where('id = :id', { id: req.params.id })
                    .addSelect('files.file_id')
                    .getOne();
                if (!model) {
                    throw { status: 404, body: { error: 'File not found' } };
                }
            }
            else {
                let type = null;
                if (mimetype.match(/^image/gi)) {
                    type = 'image';
                }
                else if (mimetype.match(/^video/gi) || name.match(/\.mp4$/gi) || name.match(/\.mkv$/gi) || name.match(/\.mov$/gi)) {
                    type = 'video';
                }
                else if (mimetype.match(/pdf$/gi) || name.match(/\.doc$/gi) || name.match(/\.docx$/gi) || name.match(/\.xls$/gi) || name.match(/\.xlsx$/gi)) {
                    type = 'document';
                }
                else if (mimetype.match(/audio$/gi) || name.match(/\.mp3$/gi) || name.match(/\.ogg$/gi)) {
                    type = 'audio';
                }
                else {
                    type = 'unknown';
                }
                model = new Files_2.Files();
                model.name = name,
                    model.mime_type = mimetype;
                model.size = size;
                model.user_id = req.user.id;
                model.type = type;
                model.parent_id = parentId || null;
                model.upload_progress = 0;
                model.file_id = big_integer_1.default.randBetween('-1e100', '1e100').toString();
                yield model.save();
            }
            let uploadPartStatus;
            const uploadPart = () => __awaiter(this, void 0, void 0, function* () {
                return yield req.tg.invoke(new telegram_1.Api.upload.SaveBigFilePart({
                    fileId: (0, big_integer_1.default)(model.file_id),
                    filePart: Number(part),
                    fileTotalParts: Number(totalPart),
                    bytes: file.buffer
                }));
            });
            try {
                uploadPartStatus = yield uploadPart();
            }
            catch (error) {
                try {
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                    yield ((_d = req.tg) === null || _d === void 0 ? void 0 : _d.connect());
                    uploadPartStatus = yield uploadPart();
                }
                catch (error) {
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                    yield ((_e = req.tg) === null || _e === void 0 ? void 0 : _e.connect());
                    uploadPartStatus = yield uploadPart();
                }
            }
            model.upload_progress = (Number(part) + 1) / Number(totalPart);
            yield model.save();
            if (Number(part) < Number(totalPart) - 1) {
                return res.status(202).send({ accepted: true, file: { id: model.id }, uploadPartStatus });
            }
            const sendData = (forceDocument) => __awaiter(this, void 0, void 0, function* () {
                return yield req.tg.sendFile('me', {
                    file: new telegram_1.Api.InputFileBig({
                        id: (0, big_integer_1.default)(model.file_id),
                        parts: Number(totalPart),
                        name: model.name
                    }),
                    forceDocument,
                    fileSize: Number(model.size),
                    attributes: forceDocument ? [
                        new telegram_1.Api.DocumentAttributeFilename({ fileName: model.name })
                    ] : undefined,
                    workers: 1
                });
            });
            let data;
            try {
                data = yield sendData(false);
            }
            catch (error) {
                data = yield sendData(true);
            }
            model.message_id = (_f = data.id) === null || _f === void 0 ? void 0 : _f.toString();
            model.uploaded_at = data.date ? new Date(data.date * 1000) : null;
            model.upload_progress = null;
            yield model.save();
            return res.status(202).send({ accepted: true, file: { id: model.id } });
        });
    }
    breadcrumbs(req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            let folder = yield Files_2.Files.findOne(id);
            if (!folder) {
                throw { status: 404, body: { error: 'File not found' } };
            }
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== folder.user_id) {
                if (!((_b = folder.sharing_options) === null || _b === void 0 ? void 0 : _b.includes('*')) && !((_c = folder.sharing_options) === null || _c === void 0 ? void 0 : _c.includes((_d = req.user) === null || _d === void 0 ? void 0 : _d.username))) {
                    throw { status: 404, body: { error: 'File not found' } };
                }
            }
            const breadcrumbs = [folder];
            while (folder.parent_id) {
                folder = yield Files_2.Files.findOne(folder.parent_id);
                if (!req.user && ((_e = folder.sharing_options) === null || _e === void 0 ? void 0 : _e.includes('*')) || ((_f = folder.sharing_options) === null || _f === void 0 ? void 0 : _f.includes((_g = req.user) === null || _g === void 0 ? void 0 : _g.username)) || folder.user_id === ((_h = req.user) === null || _h === void 0 ? void 0 : _h.id)) {
                    breadcrumbs.push(folder);
                }
            }
            return res.send({ breadcrumbs: breadcrumbs.reverse() });
        });
    }
    sync(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { parent_id: parentId, limit } = req.query;
            if (req.user.plan === 'free' || !req.user.plan) {
                throw { status: 402, body: { error: 'Payment required' } };
            }
            let files = [];
            let found = true;
            let offsetId;
            while (files.length < (Number(limit) || 10) && found) {
                const messages = yield req.tg.invoke(new telegram_1.Api.messages.GetHistory({
                    peer: 'me',
                    limit: Number(limit) || 10,
                    offsetId: offsetId || 0,
                }));
                if ((_a = messages['messages']) === null || _a === void 0 ? void 0 : _a.length) {
                    offsetId = messages['messages'][messages['messages'].length - 1].id;
                    files = [...files, ...messages['messages'].filter((msg) => { var _a, _b; return ((_a = msg === null || msg === void 0 ? void 0 : msg.media) === null || _a === void 0 ? void 0 : _a.photo) || ((_b = msg === null || msg === void 0 ? void 0 : msg.media) === null || _b === void 0 ? void 0 : _b.document); })];
                }
                else {
                    found = false;
                }
            }
            files = files.slice(0, Number(limit) || 10);
            if (files === null || files === void 0 ? void 0 : files.length) {
                const existFiles = yield Files_2.Files
                    .createQueryBuilder('files')
                    .where(`message_id IN (:...ids) AND parent_id ${parentId ? '= :parentId' : 'IS NULL'} and forward_info IS NULL`, {
                    ids: files.map(file => file.id),
                    parentId
                })
                    .getMany();
                const filesWantToSave = files.filter(file => !existFiles.find(e => e.message_id == file.id));
                if (filesWantToSave === null || filesWantToSave === void 0 ? void 0 : filesWantToSave.length) {
                    yield Files_2.Files.createQueryBuilder('files')
                        .insert()
                        .values(filesWantToSave.map(file => {
                        var _a, _b, _c, _d, _e, _f, _g;
                        const mimeType = file.media.photo ? 'image/jpeg' : file.media.document.mimeType || 'unknown';
                        const name = file.media.photo ? `${file.media.photo.id}.jpg` : ((_b = (_a = file.media.document.attributes) === null || _a === void 0 ? void 0 : _a.find((atr) => atr.fileName)) === null || _b === void 0 ? void 0 : _b.fileName) || `${(_c = file.media) === null || _c === void 0 ? void 0 : _c.document.id}.${mimeType.split('/').pop()}`;
                        const getSizes = ({ size, sizes }) => sizes ? sizes.pop() : size;
                        const size = file.media.photo ? getSizes(file.media.photo.sizes.pop()) : (_d = file.media.document) === null || _d === void 0 ? void 0 : _d.size;
                        let type = file.media.photo || mimeType.match(/^image/gi) ? 'image' : null;
                        if (((_e = file.media.document) === null || _e === void 0 ? void 0 : _e.mimeType.match(/^video/gi)) || name.match(/\.mp4$/gi) || name.match(/\.mkv$/gi) || name.match(/\.mov$/gi)) {
                            type = 'video';
                        }
                        else if (((_f = file.media.document) === null || _f === void 0 ? void 0 : _f.mimeType.match(/pdf$/gi)) || name.match(/\.doc$/gi) || name.match(/\.docx$/gi) || name.match(/\.xls$/gi) || name.match(/\.xlsx$/gi)) {
                            type = 'document';
                        }
                        else if (((_g = file.media.document) === null || _g === void 0 ? void 0 : _g.mimeType.match(/audio$/gi)) || name.match(/\.mp3$/gi) || name.match(/\.ogg$/gi)) {
                            type = 'audio';
                        }
                        return {
                            name,
                            message_id: file.id,
                            mime_type: mimeType,
                            size,
                            user_id: req.user.id,
                            uploaded_at: new Date(file.date * 1000),
                            type,
                            parent_id: parentId ? parentId.toString() : null
                        };
                    }))
                        .execute();
                }
            }
            return res.send({ files });
        });
    }
    static download(req, res, files) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { raw, dl, thumb } = req.query;
            let usage = yield Usages_1.Usages.findOne({ where: { key: req.user ? `u:${req.user.id}` : `ip:${req.headers['cf-connecting-ip'] || req.ip}` } });
            if (!usage) {
                usage = new Usages_1.Usages();
                usage.key = req.user ? `u:${req.user.id}` : `ip:${req.headers['cf-connecting-ip'] || req.ip}`;
                usage.usage = '0';
                usage.expire = (0, moment_1.default)().add(1, 'day').toDate();
                yield usage.save();
            }
            if (new Date().getTime() - new Date(usage.expire).getTime() > 0) {
                usage.expire = (0, moment_1.default)().add(1, 'day').toDate();
                usage.usage = '0';
                yield usage.save();
            }
            const totalFileSize = files.reduce((res, file) => res.add(file.size || 0), (0, big_integer_1.default)(0));
            if (!req.user || !req.user.plan || req.user.plan === 'free') {
                if ((0, big_integer_1.default)(usage.usage).add((0, big_integer_1.default)(totalFileSize)).greater(1500000000)) {
                    throw { status: 402, body: { error: 'You just hit the daily bandwidth limit' } };
                }
            }
            if (!raw || Number(raw) === 0) {
                const _b = files[0], { signed_key: _ } = _b, result = __rest(_b, ["signed_key"]);
                return res.send({ file: result });
            }
            let cancel = false;
            req.on('close', () => cancel = true);
            res.setHeader('Cache-Control', 'public, max-age=604800');
            res.setHeader('ETag', Buffer.from(`${files[0].id}:${files[0].message_id}`).toString('base64'));
            res.setHeader('Content-Disposition', (0, content_disposition_1.default)(files[0].name.replace(/\.part\d+$/gi, ''), { type: Number(dl) === 1 ? 'attachment' : 'inline' }));
            res.setHeader('Content-Type', files[0].mime_type);
            res.setHeader('Content-Length', totalFileSize.toString());
            for (const file of files) {
                let chat;
                if (file.forward_info && file.forward_info.match(/^channel\//gi)) {
                    const [type, peerId, id, accessHash] = file.forward_info.split('/');
                    let peer;
                    if (type === 'channel') {
                        peer = new telegram_1.Api.InputPeerChannel({
                            channelId: (0, big_integer_1.default)(peerId),
                            accessHash: (0, big_integer_1.default)(accessHash)
                        });
                        chat = yield req.tg.invoke(new telegram_1.Api.channels.GetMessages({
                            channel: peer,
                            id: [new telegram_1.Api.InputMessageID({ id: Number(id) })]
                        }));
                    }
                }
                else {
                    chat = yield req.tg.invoke(new telegram_1.Api.messages.GetMessages({
                        id: [new telegram_1.Api.InputMessageID({ id: Number(file.message_id) })]
                    }));
                }
                let data = null;
                const chunk = 512 * 1024;
                let idx = 0;
                while (!cancel && data === null || data.length && (0, big_integer_1.default)(file.size).greater((0, big_integer_1.default)(idx * chunk))) {
                    const getData = () => __awaiter(this, void 0, void 0, function* () {
                        return yield req.tg.downloadMedia(chat['messages'][0].media, Object.assign(Object.assign({}, thumb ? { sizeType: 'i' } : {}), { start: idx++ * chunk, end: big_integer_1.default.min((0, big_integer_1.default)(file.size), (0, big_integer_1.default)(idx * chunk - 1)).toJSNumber(), workers: 1, progressCallback: (() => {
                                const updateProgess = () => {
                                    updateProgess.isCanceled = cancel;
                                };
                                return updateProgess;
                            })() }));
                    });
                    let trial = 0;
                    while (trial < 10) {
                        try {
                            data = yield getData();
                            res.write(data);
                            trial = 10;
                        }
                        catch (error) {
                            yield new Promise(resolve => setTimeout(resolve, 1500));
                            yield ((_a = req.tg) === null || _a === void 0 ? void 0 : _a.connect());
                            trial++;
                        }
                    }
                    res.flush();
                }
                usage.usage = (0, big_integer_1.default)(file.size).add((0, big_integer_1.default)(usage.usage)).toString();
                yield usage.save();
            }
            res.end();
        });
    }
    static initiateSessionTG(req, files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(files === null || files === void 0 ? void 0 : files.length)) {
                throw { status: 404, body: { error: 'File not found' } };
            }
            let data;
            try {
                data = JSON.parse(crypto_js_1.AES.decrypt(files[0].signed_key, process.env.FILES_JWT_SECRET).toString(crypto_js_1.enc.Utf8));
            }
            catch (error) {
                console.error(error);
                throw { status: 401, body: { error: 'Invalid token' } };
            }
            try {
                const session = new sessions_1.StringSession(data.session);
                req.tg = new telegram_1.TelegramClient(session, Constant_1.TG_CREDS.apiId, Constant_1.TG_CREDS.apiHash, { connectionRetries: 5 });
            }
            catch (error) {
                throw { status: 401, body: { error: 'Invalid key' } };
            }
            return files;
        });
    }
};
__decorate([
    Endpoint_1.Endpoint.GET('/', { middlewares: [Auth_1.AuthMaybe] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "find", null);
__decorate([
    Endpoint_1.Endpoint.POST('/', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "save", null);
__decorate([
    Endpoint_1.Endpoint.POST({ middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "addFolder", null);
__decorate([
    Endpoint_1.Endpoint.GET('/:id', { middlewares: [Auth_1.AuthMaybe] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "retrieve", null);
__decorate([
    Endpoint_1.Endpoint.DELETE('/:id', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "remove", null);
__decorate([
    Endpoint_1.Endpoint.PATCH('/:id', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "update", null);
__decorate([
    Endpoint_1.Endpoint.POST('/upload/:id?', { middlewares: [Auth_1.Auth, (0, multer_1.default)().single('upload')] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "upload", null);
__decorate([
    Endpoint_1.Endpoint.GET('/breadcrumbs/:id', { middlewares: [Auth_1.AuthMaybe] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "breadcrumbs", null);
__decorate([
    Endpoint_1.Endpoint.POST('/sync', { middlewares: [Auth_1.Auth] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Files.prototype, "sync", null);
Files = Files_1 = __decorate([
    Endpoint_1.Endpoint.API()
], Files);
exports.Files = Files;
//# sourceMappingURL=Files.js.map