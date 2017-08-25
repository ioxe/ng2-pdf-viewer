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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
require("pdfjs-dist/build/pdf.combined");
PDFJS.verbosity = PDFJS.VERBOSITY_LEVELS.errors;
var PdfViewerComponent = (function () {
    function PdfViewerComponent(element) {
        this.element = element;
        this._showAll = false;
        this._renderText = true;
        this._originalSize = true;
        this._page = 1;
        this._zoom = 1;
        this._rotation = 0;
        this.afterLoadComplete = new core_1.EventEmitter();
        this.onError = new core_1.EventEmitter();
        this.onProgress = new core_1.EventEmitter();
        this.pageChange = new core_1.EventEmitter(true);
    }
    Object.defineProperty(PdfViewerComponent.prototype, "page", {
        set: function (_page) {
            _page = parseInt(_page, 10);
            if (this._pdf && !this.isValidPageNumber(_page)) {
                _page = 1;
            }
            this._page = _page;
            this.pageChange.emit(_page);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "renderText", {
        set: function (renderText) {
            this._renderText = renderText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "originalSize", {
        set: function (originalSize) {
            this._originalSize = originalSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "showAll", {
        set: function (value) {
            this._showAll = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "zoom", {
        get: function () {
            return this._zoom;
        },
        set: function (value) {
            if (value <= 0) {
                return;
            }
            this._zoom = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "rotation", {
        set: function (value) {
            if (!(typeof value === 'number' && value % 90 === 0)) {
                console.warn('Invalid pages rotation angle.');
                return;
            }
            this._rotation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "pinchZoom", {
        set: function (value) {
            this._pinchZoom = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfViewerComponent.prototype, "touchPan", {
        set: function (value) {
            this._touchPan = value;
        },
        enumerable: true,
        configurable: true
    });
    PdfViewerComponent.prototype.ngOnChanges = function (changes) {
        if ('src' in changes) {
            this.loadPDF();
        }
        else if (this._pdf) {
            this.update();
        }
    };
    PdfViewerComponent.prototype.onPageResize = function () {
        var _this = this;
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(function () {
            _this.render();
        }, 100);
    };
    PdfViewerComponent.prototype.loadPDF = function () {
        var _this = this;
        if (!this.src) {
            return;
        }
        var loadingTask = PDFJS.getDocument(this.src);
        loadingTask.onProgress = function (progressData) {
            _this.onProgress.emit(progressData);
        };
        loadingTask.promise
            .then(function (pdf) {
            _this._pdf = pdf;
            _this.afterLoadComplete.emit(pdf);
            _this.update();
        }, function (error) {
            _this.onError.emit(error);
        });
    };
    PdfViewerComponent.prototype.update = function () {
        this.page = this._page;
        this.render();
    };
    PdfViewerComponent.prototype.render = function () {
        var _this = this;
        if (!this._showAll) {
            this.renderPage(this._page).then(function (_) {
                if (_this._pinchZoom || _this._touchPan) {
                    var page = document.querySelector('.page');
                    _this.setTouchHandlers(page);
                }
            });
        }
        else {
            this.renderMultiplePages();
        }
    };
    PdfViewerComponent.prototype.renderMultiplePages = function () {
        var _this = this;
        var container = this.element.nativeElement.querySelector('div');
        this.removeAllChildNodes(container);
        var render = function (page) {
            _this.renderPage(page).then(function () {
                if (page < _this._pdf.numPages) {
                    render(page + 1);
                }
            });
        };
        render(1);
    };
    PdfViewerComponent.prototype.isValidPageNumber = function (page) {
        return this._pdf.numPages >= page && page >= 1;
    };
    PdfViewerComponent.prototype.renderPage = function (pageNumber) {
        var _this = this;
        return this._pdf.getPage(pageNumber).then(function (page) {
            var viewport = page.getViewport(_this._zoom, _this._rotation);
            var container = _this.element.nativeElement.querySelector('div');
            if (!_this._originalSize) {
                viewport = page.getViewport(_this.element.nativeElement.offsetWidth / viewport.width, _this._rotation);
            }
            if (!_this._showAll) {
                _this.removeAllChildNodes(container);
            }
            return page.getOperatorList().then(function (opList) {
                var svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs);
                return svgGfx.getSVG(opList, viewport).then(function (svg) {
                    var $div = document.createElement('div');
                    $div.classList.add('page');
                    $div.setAttribute('data-page-number', "" + page.pageNumber);
                    $div.appendChild(svg);
                    container.appendChild($div);
                });
            });
        });
    };
    PdfViewerComponent.prototype.removeAllChildNodes = function (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    };
    PdfViewerComponent.prototype.setTouchHandlers = function (elm) {
        var hammer = new Hammer(elm);
        if (this._pinchZoom) {
            hammer.get('pinch').set({ enable: true });
            hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        }
        if (this.touchPan) {
            hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        }
        var position = getAbsoluteXY(elm);
        var original_x = elm.clientWidth;
        var original_y = elm.clientHeight;
        var max_x = original_x;
        var max_y = original_y;
        var min_x = 0;
        var min_y = 0;
        var x = 0;
        var y = 0;
        var last_x = 0;
        var last_y = 0;
        var scale = 1;
        var base = scale;
        var adjustDeltaX = 0;
        var adjustDeltaY = 0;
        var currentDeltaX = 0;
        var currentDeltaY = 0;
        var lastTap = null;
        var lastPinch = null;
        hammer.on('pan', onPan);
        hammer.on('panend', onPanend);
        hammer.on('pancancel', onPanend);
        hammer.on('tap', onTap);
        hammer.on('pinch', onPinch);
        hammer.on('pinchend', onPinchend);
        hammer.on('pinchcancel', onPinchend);
        function getAbsoluteXY(element) {
            var viewportElement = document.documentElement;
            var box = element.getBoundingClientRect();
            var scrollLeft = viewportElement.scrollLeft;
            var scrollTop = viewportElement.scrollTop;
            var x = box.left + scrollLeft;
            var y = box.top + scrollTop;
            return { "x": x, "y": y };
        }
        function onPan(ev) {
            if (lastPinch) {
                console.log("checking " + lastPinch);
                var now = new Date();
                if (now.getMilliseconds() - lastPinch.getMilliseconds() < 120) {
                    return;
                }
                else {
                    lastPinch = null;
                }
            }
            transform(null, null, ev);
        }
        function onPanend(ev) {
            if (lastPinch) {
                console.log("checking " + lastPinch);
                var now = new Date();
                if (now.getMilliseconds() - lastPinch.getMilliseconds() < 120) {
                    lastPinch = null;
                    return;
                }
            }
            last_x = x;
            last_y = y;
            adjustDeltaX = currentDeltaX;
            adjustDeltaY = currentDeltaY;
        }
        function onTap(ev) {
            var now = new Date();
            if (lastTap && (now.getMilliseconds() - lastTap.getMilliseconds() < 300)) {
                console.log("absolute top left " + JSON.stringify(position));
                console.log("onTap *" + scale + " absolute center " + JSON.stringify(ev.center));
                if (scale === 1) {
                    scale = 2.2;
                    base = 2.2;
                    var center = { "x": ev.center.x - position.x, "y": ev.center.y - position.y };
                    console.log("onTap *" + scale + " relative center " + JSON.stringify(center));
                    currentDeltaX = satDelta(max_x, scale, (max_x / 2 - center.x) * scale);
                    currentDeltaY = satDelta(max_y, scale, (max_y / 2 - center.y) * scale);
                    console.log("viewport size " + original_x + ", " + original_y);
                    console.log("content size " + elm.clientWidth + ", " + elm.clientHeight);
                    console.log("distance from svg center " + (max_x / 2 - center.x) + ", " + (max_y / 2 - center.y));
                    console.log("scaled distance " + (max_x / 2 - center.x) * scale + ", " + (max_y / 2 - center.y) * scale);
                }
                else {
                    scale = 1;
                    base = 1;
                    currentDeltaX = 0;
                    currentDeltaY = 0;
                    adjustDeltaX = 0;
                    adjustDeltaY = 0;
                }
                transform(max_x / 2, max_y / 2);
                adjustDeltaX = currentDeltaX;
                adjustDeltaY = currentDeltaY;
                lastTap = null;
            }
            else {
                lastTap = new Date();
            }
        }
        function onPinch(ev) {
            console.log("onPinch *" + ev.scale + " " + ev.deltaX + "dx " + ev.deltaY + "dy center " + JSON.stringify(ev.center));
            scale = base + (ev.scale * scale - scale) / scale;
            transform();
        }
        function onPinchend(ev) {
            console.log("onPinchend *" + ev.scale + " " + ev.deltaX + "dx " + ev.deltaY + "dy center " + JSON.stringify(ev.center));
            if (scale > 4) {
                scale = 4;
            }
            if (scale < 1) {
                scale = 1;
                scale = 1;
                base = 1;
                currentDeltaX = 0;
                currentDeltaY = 0;
                transform(max_x / 2, max_y / 2);
            }
            base = scale;
            transform();
            lastPinch = new Date();
        }
        var satDelta = function (max, scale, delta) {
            var maxDelta = max * (scale - 1) / 2;
            var satDelta = delta;
            satDelta = Math.min(satDelta, maxDelta);
            satDelta = Math.max(satDelta, -maxDelta);
            return satDelta;
        };
        function transform(xx, yy, panEv) {
            if (panEv && scale > 1) {
                currentDeltaX = adjustDeltaX + panEv.deltaX;
                currentDeltaY = adjustDeltaY + panEv.deltaY;
                currentDeltaX = satDelta(max_x, scale, currentDeltaX);
                currentDeltaY = satDelta(max_y, scale, currentDeltaY);
            }
            elm.style.webkitTransform = "translate3d(" + currentDeltaX + "px, " + currentDeltaY + "px, 0) scale3d(" + scale + ", " + scale + ", 1)";
        }
    };
    __decorate([
        core_1.Output('after-load-complete'),
        __metadata("design:type", Object)
    ], PdfViewerComponent.prototype, "afterLoadComplete", void 0);
    __decorate([
        core_1.Output('error'),
        __metadata("design:type", Object)
    ], PdfViewerComponent.prototype, "onError", void 0);
    __decorate([
        core_1.Output('on-progress'),
        __metadata("design:type", Object)
    ], PdfViewerComponent.prototype, "onProgress", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], PdfViewerComponent.prototype, "src", void 0);
    __decorate([
        core_1.Input('page'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], PdfViewerComponent.prototype, "page", null);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], PdfViewerComponent.prototype, "pageChange", void 0);
    __decorate([
        core_1.Input('render-text'),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], PdfViewerComponent.prototype, "renderText", null);
    __decorate([
        core_1.Input('original-size'),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], PdfViewerComponent.prototype, "originalSize", null);
    __decorate([
        core_1.Input('show-all'),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], PdfViewerComponent.prototype, "showAll", null);
    __decorate([
        core_1.Input('zoom'),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], PdfViewerComponent.prototype, "zoom", null);
    __decorate([
        core_1.Input('rotation'),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], PdfViewerComponent.prototype, "rotation", null);
    __decorate([
        core_1.Input('pinchZoom'),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], PdfViewerComponent.prototype, "pinchZoom", null);
    __decorate([
        core_1.Input('touchPan'),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], PdfViewerComponent.prototype, "touchPan", null);
    PdfViewerComponent = __decorate([
        core_1.Component({
            selector: 'pdf-viewer',
            template: "\n      <div class=\"ng2-pdf-viewer-container\"\n           [ngClass]=\"{'ng2-pdf-viewer--zoom': zoom < 1}\"\n           (window:resize)=\"onPageResize()\"\n      ></div>\n  ",
            styles: ["\n.ng2-pdf-viewer--zoom {\n  overflow-x: scroll;\n}\n\n:host >>> .ng2-pdf-viewer-container .page {\n  background-color: #fff;\n}\n  "]
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], PdfViewerComponent);
    return PdfViewerComponent;
}());
exports.PdfViewerComponent = PdfViewerComponent;
//# sourceMappingURL=pdf-viewer.component.js.map