"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const correios = axios_1.default.create({
    baseURL: "http://ws.correios.com.br",
});
exports.default = correios;
//# sourceMappingURL=axios.js.map