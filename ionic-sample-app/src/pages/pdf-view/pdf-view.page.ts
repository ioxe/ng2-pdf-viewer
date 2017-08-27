import { Component } from '@angular/core';
import { Platform, NavParams } from 'ionic-angular';

@Component({
    selector: 'pdf-view-page',
    templateUrl: 'pdf-view.page.html'
})
export class PdfViewPage {
    currentPage: number = 1;
    totalPages: number;
    pdfLoading: boolean;
    showPageControls: boolean;
    pdfSrc: any = 'https://s3-us-west-2.amazonaws.com/timios-dev/PDF/uwm-trid-guide.pdf';

    constructor(
        private navParams: NavParams,
        private platform: Platform
    ) { }

    ionViewWillEnter() {
        // this.pdfSrc = this.navParams.data.url || this.pdfSrc
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
        }
    }

    onDocumentLoadComplete(event) {
        this.pdfLoading = false;
        this.totalPages = event.numPages;
        if (this.totalPages > 1) {
            this.showPageControls = true;
        }
    }
}
