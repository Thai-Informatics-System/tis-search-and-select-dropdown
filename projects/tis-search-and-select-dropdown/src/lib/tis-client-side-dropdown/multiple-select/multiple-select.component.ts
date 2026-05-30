import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output, SimpleChanges, VERSION, ViewChild, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { ReplaySubject, Subject, takeUntil, take, finalize, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSelect } from '@angular/material/select';
import type { ClientSideMultipleSelectionConfig } from '../../interfaces/client-side-multiple-selection-config.type';
import { ValidationMessages } from '../../interfaces/validation-messages.type';
import type { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'app-multiple-select',
  templateUrl: './multiple-select.component.html',
  styleUrl: './multiple-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultipleSelectComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class MultipleSelectComponent {
  static readonly COMPONENT_NAME = 'MultipleSelectComponent';
  @ViewChild(MatSelect) matSelect!: MatSelect;

  @Input({ required: true }) nameKey!: string;
  @Input({ required: true }) valueKey!: string;
  @Input({ required: true }) label!: string;
  @Input() placeholder!: string;
  @Input() allOptionsLabel: string = "All";
  @Input() isLabelOutside = false;
  @Input() isDisplayPlaceholder = true;
  @Input() disabled = false;
  @Input() isRequired = false;
  @Input() initialData: any[] = [];
  @Input() appearance: MatFormFieldAppearance = "outline"  // 'legacy' | 'standard' | 'fill' | 'outline';
  @Input() classes = "";
  @Input() panelClass = "";
  @Input() customId = "";
  @Input() refetch = true;
  @Input() isRequiredPayload = false;
  @Input() validationMessages: ValidationMessages[] = [];
  @Input() payload: any;
  @Input() prefix: string = '';
  @Input() suffix: string = ''; 
  @Input({ required: true }) config!: ClientSideMultipleSelectionConfig;
  @Input() loading: boolean = false;
  @Input() isRefreshing: boolean = false;

  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() initialDataChange = new EventEmitter<any>();
  @Output() refetchChange = new EventEmitter<boolean>();

  noEntriesFoundLabel: string = 'No Entries Found';

  additionalNameKeys: string[] = [];
  separatorType: string[] = ['(,)'];
  filterNameKeys: string[] = [];
  badgeKey!: string;

  selectedOptions: any[] = [];
  initialOptions: any[] = [];

  tempValue: any = null;
  isReset: boolean = false;
  isOpenSelection: boolean = false;
  isPatchValue: boolean = true;

  version = VERSION;

  /** control for the selected data */
  public listCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public searchFilterCtrl: FormControl = new FormControl('');

  /** Event that emits when the current value changes */
  private change = new EventEmitter<string>();

  /** list of data */
  data: any[] = []

  /** list of data filtered by search keyword */
  public options: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  onChange: Function = (_: any) => { };
  onTouched: Function = (_: any) => { };

  constructor(
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    // listen for search field value changes
    this.searchFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterData();
      });

    this.listCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((value: any) => {
        if (this.badgeKey) {
          this.setValueInHtml(value);
        }
        if (!this.isSameArray(this.selectedOptions, value || [])) {
          this.onSelectionChange(value || []);
        }
      });

    // detect changes when the input changes
    this.change
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.changeDetectorRef.detectChanges();
      });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isRequired']) {
      this.isRequired = changes['isRequired'].currentValue;
      if (this.isRequired) {
        this.listCtrl.setValidators(Validators.required);
      }
      else {
        this.listCtrl.removeValidators(Validators.required);
      }
      this.listCtrl.updateValueAndValidity();
    }
    if (changes['initialData']) {
      this.initialData = changes['initialData'].currentValue;
      this.data = this.initialData;
      let value: any[] = this.listCtrl.getRawValue();
      if (value && value?.length && value.indexOf('*') != -1) {
        if (this.config.isAllOption == true && this.searchFilterCtrl.value == '') {
          let opIds = this.data?.length ? this.data.map(r => r[this.valueKey]) : [];
          value = ['*', ...opIds];
          this.tempValue = value;
          this.listCtrl.setValue(value);
          this.selectedOptions.push(...value);
          this.selectedOptions = [...new Set(this.selectedOptions || [])];
        }
      }
      if (this.badgeKey) {
        this.setValueInHtml(value ?? null);
      }
      this.prepareData();
    }
    if (changes['refetch'] && changes['refetch'].currentValue == true) {
      this.getData();
      this.refetchChange.emit(false)
    }
    if (changes['payload'] && changes['payload'].isFirstChange() == false) {
      this.data = [];
    }
    if (changes['config']) {
      this.config = changes['config'].currentValue;
      if (this.config?.hint && !this.config?.hint?.color) {
        this.config.hint.color = '#f44236';
      }

      if (this.config?.createNew && !this.config?.createNew?.color) {
        this.config.createNew.color = '#36834f';
      }

      if (this.config?.noEntriesFoundLabel) {
        this.noEntriesFoundLabel = this.config.noEntriesFoundLabel;
      }

      if (this.config?.badge?.key) {
        this.badgeKey = this.config?.badge?.key;
      }

      if (this.config?.additionalName?.keys) {
        this.additionalNameKeys = this.config?.additionalName?.keys || [];
      }

      if (this.config?.additionalName?.separators) {
        this.separatorType = this.config?.additionalName?.separators;
      }

      if (this.config?.filterNameKeys) {
        this.filterNameKeys = this.config?.filterNameKeys || [];
      }

      this.getData(null, false, true);
    }
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onOpenedChange(status: any) {
    this.isOpenSelection = status;
    if (this.isOpenSelection) {
      this.setCustomClass();
    }
  }

  writeValue(value: any) {
    if (!this.isReset) {
      const valueChanged = value !== this.listCtrl.value;
      if (valueChanged) {
        if (!Array.isArray(value)) {
          value = [value];
        }
      }

      this.listCtrl.setValue(value);
    }
  }

  onInputChange(value: any) {
    if (Array.isArray(value) && value.find((v: any) => v == '*') === '*') {
      value = '*';
    }
    else if (Array.isArray(value) && value?.length === 0) {
      value = null;
    }

    this.onChange(value);
    this.change.emit(value);
    this.initialDataChange.emit(this.data);
  }

  onBlur(value: any) {
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
    this.disabled = isDisabled;
    if (this.disabled) {
      this.listCtrl.disable();
    }
    else {
      this.listCtrl.enable();
    }
  }

  setValueInHtml(value: any) {
    if (Array.isArray(value)) {
      let selectedValues = this.data.filter(v => value.includes(v[this.valueKey]));
      if (selectedValues?.length) {
        let element: any = document?.getElementById(this.customId);
        let selectedElements: HTMLCollectionOf<HTMLElement> = element?.getElementsByClassName('mat-mdc-select-value') as HTMLCollectionOf<HTMLElement>;

        // Ensure that we are working with the first element in the collection
        if (selectedElements && selectedElements.length > 0) {
          selectedElements[0].style.position = `relative`;
          let htmlStr = ``
          htmlStr += `<span class="mat-mdc-select-value-text" style=""><span class="mat-mdc-select-min-line">${selectedValues?.map(item => item[this.nameKey])?.join(', ')}`;
          let tags: any = [];

          selectedValues?.map(item => {
            if (item[this.badgeKey]?.length) {
              tags = [...tags, ...item[this.badgeKey]];
            }
          });

          tags = [...new Set(tags)];

          if (this.badgeKey && this.badgeKey != '' && tags?.length) {
            htmlStr += `<span id="selected_badge_${selectedValues?.map(item => item[this.nameKey])?.join('_')}" style="display: flex; gap: 5px; justify-content: center; align-items: center; position: absolute; right: 0px; top: 0px; background-color: white; padding-left: 5px; padding-right: 5px;">`;
            tags?.map((badge: any) => {
              if (this.getBadge(badge)) {
                htmlStr += `<span class="tis-badge-sm tis-badge-round ${this.getBadge(badge)?.class}" style="font-size: 12px !important; padding: 2px 5px !important; line-height: 16px !important;">${this.getBadge(badge)?.value}</span>`;
              }
            });
            htmlStr += `</span>`;
          }
          htmlStr += `</span></span>`;

          selectedElements[0].innerHTML = htmlStr;
        }
      }
      else {
        let element: any = document?.getElementById(this.customId);
        let selectedElements: HTMLCollectionOf<HTMLElement> = element?.getElementsByClassName('mat-mdc-select-value') as HTMLCollectionOf<HTMLElement>;

        // Ensure that we are working with the first element in the collection
        if (selectedElements && selectedElements.length > 0) {
          selectedElements[0].innerHTML = '';
        }
      }
    }
  }

  displayAdditional(data: any) {
    let dData: any = [];
    this.additionalNameKeys?.map(e => {
      if (data[e]) {
        dData.push(data[e]);
      }
    });

    dData = dData?.map((e: any, i: number) => {
      let separatorType: any = '(,)';
      if (this.separatorType[i]) {
        separatorType = this.separatorType[i]
      }

      let separatorTypeArray = separatorType.split(',');
      let finalData = e;
      finalData = separatorTypeArray?.length > 0 ? separatorTypeArray[0] + finalData : finalData;
      finalData = separatorTypeArray?.length > 1 ? finalData + separatorTypeArray[1] : finalData;
      return finalData;
    });

    if (dData?.length) {
      return `${dData.join(' ')}`;
    }
    else {
      return '';
    }

  }

  // Utility function to get nested property using a path like 'data.records'
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  onSelectionChange(value: any[]) {
    const previousSelection: any[] = this.selectedOptions?.length ? JSON.parse(JSON.stringify(this.selectedOptions)) : [];
    const newSelection: any[] = value?.length ? value : [];

    const addedValues = newSelection.filter(option => !previousSelection.includes(option));
    const removedValues: any[] = previousSelection.filter(option => !newSelection.includes(option));

    // Add new values
    if (addedValues.length > 0) {
      if (addedValues?.indexOf('*') != -1) {
        let opIds = this.data?.length ? this.data?.map(r => r[this.valueKey]) : [];
        let value = ['*', ...opIds];
        this.selectedOptions.push(...value);
      }
      else if (this.config.isAllOption == true) {
        let opIds = this.data?.length ? this.data?.map(r => r[this.valueKey]) : [];
        if (this.isSameArray(opIds, value || [])) {
          addedValues.push('*');
        }
        this.selectedOptions.push(...addedValues);
      }
      else {
        this.selectedOptions.push(...addedValues);
      }
    }

    // Remove old values
    if (removedValues.length > 0) {
      if (removedValues?.indexOf('*') != -1) {
        this.selectedOptions = [];
      }
      else {
        removedValues.push('*');
        this.selectedOptions = this.selectedOptions.filter(option => !removedValues.includes(option));
      }
    }

    this.selectedOptions = [...new Set(this.selectedOptions || [])];

    this.onInputChange(this.selectedOptions);
    this.listCtrl.setValue(this.selectedOptions);
  }

  private getData(search: string | null = null, isReset: boolean = false, initial: boolean = false) {
    if (this.config?.uri) {
      if (isReset) {
        this.isReset = isReset;
        this.listCtrl.setValue(null);
        this.tempValue = [];
        this.onInputChange(null);
      }
      let isValid = true;

      let filter: any = this.config?.filter ?? {};

      if (this.isRequiredPayload && this.config?.method == 'POST' && !Object.keys(filter)?.length) {
        isValid = false;
      }

      if (isValid) {
        this.loading = true;
        this.loadingChange.emit(true);
        this.fetchData(this.config.method ?? 'GET', this.config.uri, this.config.limit ?? 100, search, filter ?? {})
          .pipe(
            finalize(() => {
              this.loading = false;
              this.loadingChange.emit(false);
              this.isRefreshing = false;
            })
          ).subscribe((r: any) => {
            // Split the dataValueKey by '.' and navigate through the nested object
            let data = this.getNestedValue(r, this.config?.dataValueKey ?? 'data');
            this.data = data ?? [];
            this.initialOptions = data ?? [];

            this.initialDataChange.emit(this.data);
            this.prepareData();

            if (initial) {
              let value: any[] = this.listCtrl.getRawValue();
              if (value && value?.length && value.indexOf('*') != -1) {
                if (this.config.isAllOption == true && this.searchFilterCtrl.value == '') {
                  let opIds = this.data?.length ? this.data.map(r => r[this.valueKey]) : [];
                  value = ['*', ...opIds];
                  this.tempValue = value;
                  this.listCtrl.setValue(value);
                  this.selectedOptions.push(...value);
                  this.selectedOptions = [...new Set(this.selectedOptions || [])];
                }
              }
              else if (this.config?.setFirstOption && Array.isArray(this.data) && this.data?.length) {
                if (this.config?.ifLengthOnlyOne === true) {
                  if (this.data?.length == 1) {
                    this.listCtrl.setValue([this.data[0][this.valueKey]]);
                    this.selectedOptions = [this.data[0][this.valueKey]];
                  }
                }
                else {
                  this.listCtrl.setValue([this.data[0][this.valueKey]]);
                  this.selectedOptions = [this.data[0][this.valueKey]];
                }
              }
            }
          });
      }
    }
    else if (this.config?.setFirstOption && Array.isArray(this.initialData) && this.initialData?.length) {
      setTimeout(() => {
        if (this.config?.ifLengthOnlyOne === true) {
          if (this.initialData?.length == 1) {
            this.listCtrl.setValue([this.data[0][this.valueKey]]);
            this.selectedOptions = [this.data[0][this.valueKey]];
          }
        }
        else {
          this.listCtrl.setValue([this.data[0][this.valueKey]]);
          this.selectedOptions = [this.data[0][this.valueKey]];
        }
      }, 50);
    }
  }

  private prepareData() {
    // load the initial data list
    if (Array.isArray(this.data) && this.data?.length) {
      this.options.next(this.data.slice());
    }
    else {
      this.options.next([]);
    }
    setTimeout(() => {
      this.isReset = false;
    }, 300);
  }

  refreshData() {
    this.isRefreshing = true;
    setTimeout(() => {
      this.getData(null, true);
    }, 20);
  }

  private filterData() {
    if (!this.data) {
      return;
    }
    // get the search keyword
    let search = this.searchFilterCtrl.value;
    if (!search) {
      this.data = this.initialData;
      this.options.next(this.initialData?.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the data

    let data: any[] = this.data?.length ? JSON.parse(JSON.stringify(this.data)) : [];

    data = data?.filter(d => d && Object.keys(d).length > 0);

    // data = data.map(d => {
    //   if (d[this.nameKey]?.toLowerCase()?.indexOf(search) > -1) {
    //     d.isHidden = false;
    //   }
    //   else {
    //     d.isHidden = true;
    //   }

    //   return d;
    // });

    data = data.map(d => {
      // Check main nameKey
      let matches = d[this.nameKey]?.toLowerCase()?.indexOf(search) > -1;

      // Check additionalNameKeys
      if (!matches && Array.isArray(this.additionalNameKeys) && this.additionalNameKeys.length) {
        matches = this.additionalNameKeys.some(key =>
          d[key]?.toString()?.toLowerCase()?.indexOf(search) > -1
        );
      }

      // Check filterNameKeys
      if (!matches && Array.isArray(this.filterNameKeys) && this.filterNameKeys.length) {
        matches = this.filterNameKeys.some(key =>
          d[key]?.toString()?.toLowerCase()?.indexOf(search) > -1
        );
      }

      d.isHidden = !matches;
      return d;
    });

    this.options.next(data);
  }

  private fetchData(method: string, uri: string, limit: number = 30, searchValue: string | null, data: object = {}): Observable<any> {
    var query = new URLSearchParams();

    if (searchValue) {
      query.append("search", `${searchValue}`);
    }

    if (limit) {
      query.append("limit", `${limit}`);
    }

    let url = `${uri}?${query.toString()}`;

    if (method == 'POST') {
      return this.http.post(`${url}`, JSON.stringify(data));
    }
    else {
      return this.http.get(`${url}`);
    }
  }

  getBadge(key: number | string): any {
    if (this.config?.badge?.classConditionList?.length) {
      let selectedClassCondition = this.config?.badge?.classConditionList?.find(cc => cc.key == key);
      if (selectedClassCondition) {
        return selectedClassCondition;
      }
      else {
        return null;
      }
    }
    else {
      return null;
    }
  }

  setPadding(key: string | number) {
    let id = `badge_${key}`;
    // Get the element by ID
    const element = document.getElementById(id);

    // Get the width of the element
    const width = element?.offsetWidth;

    if (width) {
      return `${width + 10}px`;
    }
    return `16px`;
  }

  setCustomClass() {
    // set custom panel class
    const panelClass = `tis-dropdown-panel tis-client-side-multiple-select-panel ${this.panelClass}`;
    if (this.matSelect.panelClass) {
      if (Array.isArray(this.matSelect.panelClass)) {
        this.matSelect.panelClass.push(panelClass);
      } else if (typeof this.matSelect.panelClass === 'string') {
        this.matSelect.panelClass = [this.matSelect.panelClass, panelClass];
      } else if (typeof this.matSelect.panelClass === 'object') {
        let panelClassObj: any = { ...this.matSelect.panelClass };
        panelClassObj[panelClass] = true;
        this.matSelect.panelClass = panelClassObj;
      }
    } else {
      this.matSelect.panelClass = panelClass;
    }

    setTimeout(() => {
      this.setSearchFieldWith();
    }, 100);
  }

  setSearchFieldWith() {
    const parent = document.querySelector('.tis-dropdown-panel') as HTMLElement;
    const child = document.querySelector('.mat-select-search-inner') as HTMLElement;

    if (parent && child) {
      const parentWidth = parent.offsetWidth;
      child.style.width = `${parentWidth - 6}px`;
    }
  }

  isSameArray(arr1: any[], arr2: any[]): boolean {
    // Sort the arrays
    const sortedArr1 = arr1?.slice().sort();
    const sortedArr2 = arr2?.slice().sort();
    // Compare the sorted arrays
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
  }

  get checkValidation(){
    return this.listCtrl.hasValidator(Validators.required);
  }
}