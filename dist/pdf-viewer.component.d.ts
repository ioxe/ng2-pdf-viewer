/// <reference types="pdf" />
import { ElementRef, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import 'pdfjs-dist/build/pdf.combined';
import { Content } from 'ionic-angular';
export declare class PdfViewerComponent implements OnChanges {
    private element;
    private content;
    private _showAll;
    private _renderText;
    private _originalSize;
    private _pdf;
    private _page;
    private _zoom;
    private _rotation;
    private _pinchZoom;
    private _touchPan;
    private resizeTimeout;
    afterLoadComplete: EventEmitter<PDFDocumentProxy>;
    onError: EventEmitter<any>;
    onProgress: EventEmitter<PDFProgressData>;
    constructor(element: ElementRef, content: Content);
    src: string | Uint8Array | PDFSource;
    page: any;
    pageChange: EventEmitter<number>;
    renderText: boolean;
    originalSize: boolean;
    showAll: boolean;
    zoom: number;
    rotation: number;
    pinchZoom: boolean;
    touchPan: boolean;
    ngOnChanges(changes: SimpleChanges): void;
    onPageResize(): void;
    private loadPDF();
    private update();
    private render();
    private renderMultiplePages();
    private isValidPageNumber(page);
    private renderPage(pageNumber);
    private roundToDivide(x, div);
    private approximateFraction(x);
    getOutputScale(ctx: any): {
        sx: number;
        sy: number;
        scaled: boolean;
    };
    private removeAllChildNodes(element);
    private setTouchHandlers(elm, content);
}
