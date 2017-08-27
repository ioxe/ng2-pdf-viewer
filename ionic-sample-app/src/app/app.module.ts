import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { PdfViewPage } from '../pages/pdf-view/pdf-view.page';
import { PdfSelectPage } from '../pages/pdf-select/pdf-select.page'

import { PdfViewerComponent } from '../../../src/pdf-viewer/pdf-viewer.component';

@NgModule({
  declarations: [
    MyApp,
    PdfViewPage,
    PdfSelectPage,
    PdfViewerComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    PdfViewPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
