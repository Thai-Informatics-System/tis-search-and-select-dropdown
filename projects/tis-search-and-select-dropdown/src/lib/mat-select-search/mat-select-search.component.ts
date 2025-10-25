import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ElementRef, EventEmitter, forwardRef, Inject, Input, OnDestroy, OnInit, QueryList,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';
import { MatOption } from '@angular/material/core';
import { Subject } from 'rxjs';
import { MatSelect } from '@angular/material/select';


@Component({
    selector: 'mat-select-search',
    templateUrl: './mat-select-search.component.html',
    styleUrls: ['./mat-select-search.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MatSelectSearchComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class MatSelectSearchComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {

  val: any;

  /** Label of the search placeholder */
  @Input() placeholderLabel = 'Select';

  /** Label of the search placeholder */
  @Input() loading = false;

  /** Label to be shown when no entries are found. Set to null if no message should be shown. */
  @Input() noEntriesFoundLabel = 'No Entries Found';

  /** Reference to the search input field */
  @ViewChild('searchSelectInput', { read: ElementRef, static: true }) searchSelectInput!: ElementRef;

  /** Current search value */
  get value(): string {
    return this._value;
  }
  private _value!: string;

  onChange: Function = (_: any) => { };
  onTouched: Function = (_: any) => { };

  /** Reference to the MatSelect options */
  public _options!: QueryList<MatOption>;

  /** Previously selected values when using <mat-select [multiple]="true">*/
  private previousSelectedValues!: any[];

  /** Whether the backdrop class has been set */
  private overlayClassSet = false;

  /** Event that emits when the current value changes */
  private change = new EventEmitter<string>();

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();


  constructor(@Inject(MatSelect) public matSelect: MatSelect,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  /**
   * Detects if the current device is a mobile device
   * @private
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  ngOnInit() {
    // set custom panel class
    const panelClass = 'mat-select-search-panel';
    if (this.matSelect.panelClass) {
      if (Array.isArray(this.matSelect.panelClass)) {
        this.matSelect.panelClass.push(panelClass);
      } else if (typeof this.matSelect.panelClass === 'string') {
        this.matSelect.panelClass = [this.matSelect.panelClass, panelClass];
      } else if (typeof this.matSelect.panelClass === 'object') {
        let panelClassObj:any = {...this.matSelect.panelClass};
        panelClassObj[panelClass] = true;
        this.matSelect.panelClass = panelClassObj;
      }
    } else {
      this.matSelect.panelClass = panelClass;
    }

    // when the select dropdown panel is opened or closed
    this.matSelect.openedChange
      .pipe(takeUntil(this._onDestroy))
      .subscribe((opened) => {
        if (opened) {
          // focus the search field when opening
          this._focus();
        } else {
          // clear it when closing
          this._reset();
        }
      });

    // set the first item active after the options changed
    this.matSelect.openedChange
      .pipe(take(1))
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this._options = this.matSelect.options;
        this._options.changes
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            const keyManager = this.matSelect._keyManager;
            if (keyManager && this.matSelect.panelOpen) {
              // avoid "expression has been changed" error
              setTimeout(() => {
                keyManager.setFirstItemActive();
              });
            }
          });
      });

    // detect changes when the input changes
    this.change
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.changeDetectorRef.detectChanges();
      });

    this.initMultipleHandling();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngAfterViewInit() {
    this.setOverlayClass();
    this.setupMobileKeyboardHandling();
  }

  /**
   * Handles the key down event with MatSelect.
   * Allows e.g. selecting with enter key, navigation with arrow keys, etc.
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === 32) {
      // do not propagate spaces to MatSelect, as this would select the currently active option
      event.stopPropagation();
    }

  }


  writeValue(value: string) {
    const valueChanged = value !== this._value;
    if (valueChanged) {
      this._value = value;
      this.change.emit(value);
    }
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value !== this._value) {
      this._value = value;
      this.onChange(value);
      this.change.emit(value);
    }
  }
  
  onBlur(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onTouched();
  }

  /**
   * Handles input focus event
   * @param event 
   */
  onInputFocus(event: Event): void {
    // Allow keyboard to show naturally on mobile
    // This is called when user clicks the input
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  /**
   * Focuses the search input field
   * @private
   */
  public _focus() {
    if (!this.searchSelectInput) {
      return;
    }
    // save and restore scrollTop of panel, since it will be reset by focus()
    // note: this is hacky
    const panel = this.matSelect.panel?.nativeElement;
    if (!panel) return;
    
    const scrollTop = panel.scrollTop;

    // focus - use click() for mobile compatibility
    const input = this.searchSelectInput.nativeElement;
    if (this.isMobileDevice()) {
      // On mobile, trigger click to show keyboard
      input.click();
      setTimeout(() => input.focus(), 0);
    } else {
      input.focus();
    }

    panel.scrollTop = scrollTop;
  }

  /**
   * Resets the current search value
   * @param {boolean} focus whether to focus after resetting
   * @private
   */
  public _reset(focus?: boolean) {
    if (!this.searchSelectInput) {
      return;
    }
    this.searchSelectInput.nativeElement.value = '';
    const event = new Event('input');
    Object.defineProperty(event, 'target', {
      value: { value: '' },
    });
    this.onInputChange(event);
    if (focus) {
      this._focus();
    }
  }

  /**
   * Sets the overlay class  to correct offsetY
   * so that the selected option is at the position of the select box when opening
   */
  private setOverlayClass() {
    if (this.overlayClassSet) {
      return;
    }
    const overlayClass = 'cdk-overlay-pane-select-search';

    this.matSelect.openedChange
      .pipe(takeUntil(this._onDestroy))
      .subscribe((opened: boolean) => {
        if (opened) {
          // note: this is hacky, but currently there is no better way to do this
          let element: any = this.searchSelectInput.nativeElement;
          // Delay to allow Angular Material animations to complete
          setTimeout(() => {
            // console.log("==== auto focused ===", element);
            const input: HTMLInputElement | null = element.querySelector('input');
            if (input) {
              if (this.isMobileDevice()) {
                // // On mobile, trigger click to show keyboard
                // input.click();
                // setTimeout(() => input.focus(), 0);
              } else {
                input.focus();
              }
              // console.log("==== auto focused ===", input);
            } else {
              // console.warn("Input element not found inside container");
            }
          }, 100);
          let overlayElement: any;
          while (element = element.parentElement) {
            if (element.classList.contains('cdk-overlay-pane')) {
              overlayElement = element;
              break;
            }
          }
          if (overlayElement) {
            overlayElement.classList.add(overlayClass);
          }
        }
      });

    this.overlayClassSet = true;
  }


  /**
   * Sets up mobile keyboard handling to hide keyboard on outside clicks
   * @private
   */
  private setupMobileKeyboardHandling() {
    if (!this.isMobileDevice()) {
      return;
    }

    // Listen for option selection to hide keyboard
    this.matSelect.optionSelectionChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.hideKeyboard();
      });

    // Listen for clicks on the panel to hide keyboard when clicking outside input
    this.matSelect.openedChange
      .pipe(takeUntil(this._onDestroy))
      .subscribe((opened: boolean) => {
        if (opened) {
          setTimeout(() => {
            const panel = this.matSelect.panel?.nativeElement;
            if (panel) {
              panel.addEventListener('click', this.handlePanelClick.bind(this));
            }
          }, 100);
        }
      });
  }

  /**
   * Handles clicks on the panel to hide keyboard when clicking outside input
   * @private
   */
  private handlePanelClick(event: MouseEvent) {
    const input = this.searchSelectInput?.nativeElement;
    const target = event.target as HTMLElement;
    
    // Check if the click is outside the input field
    if (input && !input.contains(target) && !target.closest('.mat-select-search-input')) {
      this.hideKeyboard();
    }
  }

  /**
   * Hides the mobile keyboard by blurring the input
   * @private
   */
  private hideKeyboard() {
    if (!this.isMobileDevice()) {
      return;
    }

    const input = this.searchSelectInput?.nativeElement;
    if (input) {
      input.blur();
    }
  }

  /**
   * Initializes handling <mat-select [multiple]="true">
   * Note: to improve this code, mat-select should be extended to allow disabling resetting the selection while filtering.
   */
  private initMultipleHandling() {
    // if <mat-select [multiple]="true">
    // store previously selected values and restore them when they are deselected
    // because the option is not available while we are currently filtering
    this.matSelect.valueChange
      .pipe(takeUntil(this._onDestroy))
      .subscribe((values) => {
        if (this.matSelect.multiple) {
          let restoreSelectedValues = false;
          if (this._value && this._value.length
            && this.previousSelectedValues && Array.isArray(this.previousSelectedValues)) {
            if (!values || !Array.isArray(values)) {
              values = [];
            }
            const optionValues = this.matSelect.options.map(option => option.value);
            this.previousSelectedValues.forEach(previousValue => {
              if (values.indexOf(previousValue) === -1 && optionValues.indexOf(previousValue) === -1) {
                // if a value that was selected before is deselected and not found in the options, it was deselected
                // due to the filtering, so we restore it.
                values.push(previousValue);
                restoreSelectedValues = true;
              }
            });
          }

          if (restoreSelectedValues) {
            this.matSelect._onChange(values);
          }

          this.previousSelectedValues = values;
        }
      });
  }

}