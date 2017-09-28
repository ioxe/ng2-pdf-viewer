"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var pdf_viewer_component_1 = require("./pdf-viewer.component");
var PdfViewerModule = (function () {
    function PdfViewerModule() {
    }
    return PdfViewerModule;
}());
PdfViewerModule.decorators = [
    { type: core_1.NgModule, args: [{
                imports: [common_1.CommonModule],
                declarations: [pdf_viewer_component_1.PdfViewerComponent],
                exports: [pdf_viewer_component_1.PdfViewerComponent]
            },] },
];
PdfViewerModule.ctorParameters = function () { return []; };
exports.PdfViewerModule = PdfViewerModule;
//# sourceMappingURL=pdf-viewer.module.js.map