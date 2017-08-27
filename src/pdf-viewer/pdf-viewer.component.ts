/**
 * Created by vadimdez on 21/06/16.
 */
import {
  Component, Input, Output, ElementRef, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import 'pdfjs-dist/build/pdf.combined';
PDFJS.verbosity = (<any>PDFJS).VERBOSITY_LEVELS.errors;

declare var Hammer: any;

@Component({
  selector: 'pdf-viewer',
  template: `
      <div class="ng2-pdf-viewer-container"
           [ngClass]="{'ng2-pdf-viewer--zoom': zoom < 1}"
           (window:resize)="onPageResize()"
      ></div>
  `,
  styles: [`
.ng2-pdf-viewer--zoom {
  overflow-x: scroll;
}

:host >>> .ng2-pdf-viewer-container .page {
  background-color: #fff;
}
  `]
})

export class PdfViewerComponent implements OnChanges {
  private _showAll: boolean = false;
  private _renderText: boolean = true;
  private _originalSize: boolean = true;
  private _pdf: PDFDocumentProxy;
  private _page: number = 1;
  private _zoom: number = 1;
  private _rotation: number = 0;
  private _pinchZoom: boolean;
  private _touchPan: boolean;
  private resizeTimeout: NodeJS.Timer;

  @Output('after-load-complete') afterLoadComplete = new EventEmitter<PDFDocumentProxy>();
  @Output('error') onError = new EventEmitter<any>();
  @Output('on-progress') onProgress = new EventEmitter<PDFProgressData>();

  constructor(private element: ElementRef) { }

  @Input()
  src: string | Uint8Array | PDFSource;

  @Input('page')
  set page(_page) {
    _page = parseInt(_page, 10);

    if (this._pdf && !this.isValidPageNumber(_page)) {
      _page = 1;
    }

    this._page = _page;
    this.pageChange.emit(_page);
  }

  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>(true);

  @Input('render-text')
  set renderText(renderText: boolean) {
    this._renderText = renderText;
  }

  @Input('original-size')
  set originalSize(originalSize: boolean) {
    this._originalSize = originalSize;
  }

  @Input('show-all')
  set showAll(value: boolean) {
    this._showAll = value;
  }

  @Input('zoom')
  set zoom(value: number) {
    if (value <= 0) {
      return;
    }

    this._zoom = value;
  }

  get zoom() {
    return this._zoom;
  }

  @Input('rotation')
  set rotation(value: number) {
    if (!(typeof value === 'number' && value % 90 === 0)) {
      console.warn('Invalid pages rotation angle.');
      return;
    }

    this._rotation = value;
  }

  @Input('pinchZoom')
  set pinchZoom(value: boolean) {
    this._pinchZoom = value;
  }

  @Input('touchPan')
  set touchPan(value: boolean) {
    this._touchPan = value;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('src' in changes) {
      this.loadPDF();
    } else if (this._pdf) {
      this.update();
    }
  }

  public onPageResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.render();
    }, 100);
  }

  private loadPDF() {
    if (!this.src) {
      return;
    }

    let loadingTask: any = PDFJS.getDocument(this.src as any);

    loadingTask.onProgress = (progressData: PDFProgressData) => {
      this.onProgress.emit(progressData);
    };

    (<PDFPromise<PDFDocumentProxy>>loadingTask.promise)
      .then(pdf => {
        this._pdf = pdf;

        this.afterLoadComplete.emit(pdf);

        this.update();
      }, (error: any) => {
        this.onError.emit(error);
      });
  }

  private update() {
    this.page = this._page;

    this.render();
  }

  private render() {
    if (!this._showAll) {
      this.renderPage(this._page).then(_ => {
        if (this._pinchZoom || this._touchPan) {
          let page = document.querySelector('.page');
          this.setTouchHandlers(page as any);
        }
      });
    } else {
      this.renderMultiplePages();
    }
  }

  private renderMultiplePages() {
    let container = this.element.nativeElement.querySelector('div');

    this.removeAllChildNodes(container);

    // render pages synchronously
    const render = (page: number) => {
      this.renderPage(page).then(() => {
        if (page < this._pdf.numPages) {
          render(page + 1);
        }
      });
    };

    render(1);
  }

  private isValidPageNumber(page: number): boolean {
    return this._pdf.numPages >= page && page >= 1;
  }

  private renderPage(pageNumber: number): PDFPromise<void> {
    return this._pdf.getPage(pageNumber).then((page: PDFPageProxy) => {
      let viewport = page.getViewport(this._zoom, this._rotation);
      let container = this.element.nativeElement.querySelector('div');

      if (!this._originalSize) {
        viewport = page.getViewport(this.element.nativeElement.offsetWidth / viewport.width, this._rotation);
      }

      if (!this._showAll) {
        this.removeAllChildNodes(container);
      }

      return (<any>page).getOperatorList().then(function (opList) {
        let svgGfx = new (<any>PDFJS).SVGGraphics((<any>page).commonObjs, (<any>page).objs);

        return svgGfx.getSVG(opList, viewport).then(function (svg) {
          let $div = document.createElement('div');

          $div.classList.add('page');
          $div.setAttribute('data-page-number', `${page.pageNumber}`);

          $div.appendChild(svg);
          container.appendChild($div);
        });
      });
    });
  }

  private removeAllChildNodes(element: HTMLElement) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  private setTouchHandlers(elm) {
    const hammer = new Hammer(elm);
    if (this._pinchZoom) {
      hammer.get('pinch').set({ enable: true });
      hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    }
    if (this.touchPan) {
      hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    }
    let position = getAbsoluteXY(elm);
    const original_x = elm.clientWidth;
    const original_y = elm.clientHeight;
    let max_x = original_x;
    let max_y = original_y;
    let min_x = 0;
    let min_y = 0;
    let x = 0;
    let y = 0;
    let last_x = 0;
    let last_y = 0;
    let scale = 1;
    let base = scale;
    let adjustDeltaX = 0;
    let adjustDeltaY = 0;
    let currentDeltaX = 0;
    let currentDeltaY = 0;
    let lastTap: Date = null;
    let lastPinch: Date = null;
    hammer.on('pan', onPan);
    hammer.on('panend', onPanend);
    hammer.on('pancancel', onPanend);
    // _swipeGesture.on('swipe', onSwipe)
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
        console.log(`checking ${lastPinch}`);
        let now = new Date();
        if (now.getMilliseconds() - lastPinch.getMilliseconds() < 120) {
          return;
        } else {
          lastPinch = null;
        }
      }
      //console.log(`onPan *${scale} ${ev.deltaX}dx ${ev.deltaY}dy center ${JSON.stringify(ev.center)}`)
      transform(null, null, ev);
    }
    function onPanend(ev) {
      if (lastPinch) {
        console.log(`checking ${lastPinch}`);
        let now = new Date();
        if (now.getMilliseconds() - lastPinch.getMilliseconds() < 120) {
          lastPinch = null;
          return;
        }
      }
      //console.log(`onPanend *${scale} ${ev.deltaX}dx ${ev.deltaY}dy center ${JSON.stringify(ev.center)}`)
      // remembers previous position to continue panning.
      last_x = x;
      last_y = y;
      adjustDeltaX = currentDeltaX;
      adjustDeltaY = currentDeltaY;
    }
    function onTap(ev) {
      let now = new Date();

      if (lastTap && (now.getMilliseconds() - lastTap.getMilliseconds() < 300)) {
        console.log(`absolute top left ${JSON.stringify(position)}`);
        console.log(`onTap *${scale} absolute center ${JSON.stringify(ev.center)}`);
        if (scale === 1) {
          scale = 2.2;
          base = 2.2;
          // scale * distance from center
          var center = { "x": ev.center.x - position.x, "y": ev.center.y - position.y };
          console.log(`onTap *${scale} relative center ${JSON.stringify(center)}`);
          currentDeltaX = satDelta(max_x, scale, (max_x / 2 - center.x) * scale);
          currentDeltaY = satDelta(max_y, scale, (max_y / 2 - center.y) * scale);
          console.log(`viewport size ${original_x}, ${original_y}`);
          console.log(`content size ${elm.clientWidth}, ${elm.clientHeight}`);
          console.log(`distance from svg center ${(max_x / 2 - center.x)}, ${max_y / 2 - center.y}`);
          console.log(`scaled distance ${(max_x / 2 - center.x) * scale}, ${(max_y / 2 - center.y) * scale}`);
        } else {
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
      } else {
        lastTap = new Date();
      }
    }
    function onPinch(ev) {
      console.log(`onPinch *${ev.scale} ${ev.deltaX}dx ${ev.deltaY}dy center ${JSON.stringify(ev.center)}`);
      scale = base + (ev.scale * scale - scale) / scale;
      transform();
    }
    function onPinchend(ev) {
      console.log(`onPinchend *${ev.scale} ${ev.deltaX}dx ${ev.deltaY}dy center ${JSON.stringify(ev.center)}`);
      if (scale > 4) {
        scale = 4;
      }
      if (scale < 1) {
        scale = 1;
        scale = 1;
        base = 1;
        currentDeltaX = 0;
        currentDeltaY = 0;
        //setBounds();
        transform(max_x / 2, max_y / 2);
      }
      // lets pinch know where the new base will start
      base = scale;
      transform();
      lastPinch = new Date();
    }
    var satDelta = function (max, scale, delta) {
      // max translation from center = (+/-) scaled dimension / 2
      var maxDelta = max * (scale - 1) / 2;
      var satDelta = delta;
      satDelta = Math.min(satDelta, maxDelta);
      satDelta = Math.max(satDelta, -maxDelta);
      return satDelta;
    };
    // xx && yy are for resetting the position when the scale return to 1.
    function transform(xx?: number, yy?: number, panEv?) {
      if (panEv && scale > 1) {
        currentDeltaX = adjustDeltaX + panEv.deltaX;
        currentDeltaY = adjustDeltaY + panEv.deltaY;
        currentDeltaX = satDelta(max_x, scale, currentDeltaX);
        currentDeltaY = satDelta(max_y, scale, currentDeltaY);
      }
      //console.log(`translate ${currentDeltaX}px, ${currentDeltaY}px, scale ${scale}`)
      elm.style.webkitTransform = `translate3d(${currentDeltaX}px, ${currentDeltaY}px, 0) scale3d(${scale}, ${scale}, 1)`;
    }
  }
}
