import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { PdfViewPage } from '../pdf-view/pdf-view.page'

@Component({
    selector: 'pdf-select-page',
    templateUrl: 'pdf-select.page.html'
})
export class PdfSelectPage {
    constructor(
        private navCtrl: NavController,
        private platform: Platform
    ) { }

    onSubmit(url: string) {
        console.log(url);
        this.navCtrl.push(PdfViewPage, { url });
    }
}