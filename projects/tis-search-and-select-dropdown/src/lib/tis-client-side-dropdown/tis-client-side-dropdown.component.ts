import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import type { ClientSideSingleSelectionConfig } from '../interfaces/client-side-single-selection-config.type';
import { SelectedFilterDisplayValuesType } from '../interfaces/tis-selection-config.type';
import { ValidationMessages } from '../interfaces/validation-messages.type';
import type { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'tis-client-side-dropdown',
  standalone: false,
  templateUrl: './tis-client-side-dropdown.component.html',
  styleUrl: './tis-client-side-dropdown.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TisClientSideDropdownComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TisClientSideDropdownComponent {
  @Input() formControlName!: string;
  @Input({ required: true }) type: string = 'single';
  @Input({ required: true }) label!: string;
  @Input() placeholder!: string;
  @Input() disabled = false;
  @Input() isRequired = false;
  @Input({ required: true }) nameKey!: string;
  @Input({ required: true }) valueKey!: string;
  @Input() data: any[] = [];
  @Input() payload = {};
  @Input() isRequiredPayload = false;
  @Input() appearance: MatFormFieldAppearance = "outline"  // 'legacy' | 'standard' | 'fill' | 'outline';
  @Input() classes = "";
  @Input() panelClass = "";
  @Input() validationMessages: ValidationMessages[] = [];
  @Input({ required: true }) config!: ClientSideSingleSelectionConfig;
  @Input() loading: boolean = false;
  @Input() isRefreshing: boolean = false;

  @Output() dataChange = new EventEmitter<any>();
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() selectedValueNamesUpdated = new EventEmitter<SelectedFilterDisplayValuesType>();

  fc = new FormControl();

  toggle = true;

  onChange: Function = (_: any) => { };
  onTouched: Function = (_: any) => { };

  private disable = false;

  /** Event that emits when the current value changes */
  private change = new EventEmitter<any>();

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.validationMessages?.map(v => {
      if (v.type == 'required') {
        this.isRequired = true;
      }
    });

    this.fc.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        this.onInputChange(value);
      });

    // detect changes when the input changes
    this.change
      .pipe(takeUntil(this._onDestroy))
      .subscribe((value) => {
        this.changeDetectorRef.detectChanges();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log("=== data ===", changes);
    if (changes['disabled']) {
      this.disabled = changes['disabled'].currentValue;
      this.setDisabledState(this.disabled);
      // console.log("=== tis-select-client-side :: ngOnChanges['config'] ===", this.config);
    }

    if (changes['payload']) {
      if (changes['payload']?.currentValue && Object.keys(changes['payload'].currentValue)?.length) {
        this.config.filter = { ...this.config.filter, ...changes['payload'].currentValue };
        this.toggle = !this.toggle;
      }
    }

    if (changes['config']) {
      this.config = changes['config'].currentValue;
      if (this.payload && Object.keys(this.payload)?.length) {
        this.config.filter = { ...this.config.filter, ...this.payload };
      }
    }

    if (changes['data']) {
      if (this.fc?.value) {
        this.handleSelectedListChange(this.fc.value);
      }
    }

  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngAfterViewInit() {
  }

  setData(data: any[]) {
    this.data = data;
    this.handleSelectedListChange(this.fc.getRawValue());
    this.dataChange.emit(data);
  }

  writeValue(value: any) {
    if (Array.isArray(value)) {
      // Ensure the value is always an array or null
      value = value.filter(e => e !== null);
      if (!value.length) value = null;
    }

    const valueChanged = JSON.stringify(value) !== JSON.stringify(this.fc.value);

    if (valueChanged) {
      this.fc.setValue(value, { emitEvent: false });
      this.onChange(value);
      this.handleSelectedListChange(value);

      // Force change detection
      this.changeDetectorRef.markForCheck();
    }
  }

  onInputChange(value: any) {
    // Ensure value updates correctly
    if (Array.isArray(value) && value.length) {
      value = value.filter(e => e !== null);
      if (!value.length) value = null;
    }

    this.handleSelectedListChange(value);
    this.onChange(value);
    this.change.emit(value);

    // Force change detection
    this.changeDetectorRef.detectChanges();
  }

  onBlur(value: string) {
    this.writeValue(value);
    this.onTouched();
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disable = isDisabled;
    if (isDisabled) {
      this.fc.disable({ emitEvent: false });
    } else {
      this.fc.enable({ emitEvent: false });
    }
    this.changeDetectorRef.markForCheck();
  }


  handleSelectedListChange(value: any) {
    const selectedList: SelectedFilterDisplayValuesType = [];
    if (Array.isArray(value)) {
      value.forEach(v => {
        if (v != '*') {
          let obj = this.data?.filter(d => d && Object.keys(d).length > 0)?.find(d => d[this.valueKey] == v);
          if (obj) {
            selectedList.push({ value: obj[this.valueKey], valueKey: obj[this.nameKey], formControlName: this.formControlName, formControlType: 'search-select', selectedObjData: obj, isSingleValue: this.type == 'single' });
          }
        }
      })
    } else {
      if (value != '*') {
        let obj = this.data?.filter(d => d && Object.keys(d).length > 0)?.find(d => d[this.valueKey] == value);
        if (obj) {
          selectedList.push({ value: obj[this.valueKey], valueKey: obj[this.nameKey], formControlName: this.formControlName, formControlType: 'search-select', selectedObjData: obj, isSingleValue: this.type == 'single' });
        }
      }
    }
    this.selectedValueNamesUpdated.emit(selectedList);
  }

  onLoadingChange(status: boolean) {
    this.loading = false;
    this.loadingChange.emit(status);
  }
}
