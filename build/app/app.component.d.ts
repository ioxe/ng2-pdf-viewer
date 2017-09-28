/// <reference types="pdf" />
export declare class AppComponent {
    pdfSrc: string;
    error: any;
    page: number;
    rotation: number;
    zoom: number;
    originalSize: boolean;
    showAll: boolean;
    pdf: any;
    renderText: boolean;
    progressData: PDFProgressData;
    isLoaded: boolean;
    touchPan: boolean;
    pinchZoom: boolean;
    incrementPage(amount: number): void;
    incrementZoom(amount: number): void;
    rotate(angle: number): void;
    onFileSelected(): void;
    afterLoadComplete(pdf: PDFDocumentProxy): void;
    onError(error: any): void;
    onProgress(progressData: PDFProgressData): void;
    getInt(value: number): number;
}
