import { NgModule} from '@angular/core';
import { CommonModule} from '@angular/common';
import { PdfViewerComponent } from './pdf-viewer.component';

@NgModule({
    imports: [CommonModule],
    declarations: [PdfViewerComponent],
    exports: [PdfViewerComponent]
})
export class PdfViewerModule { }