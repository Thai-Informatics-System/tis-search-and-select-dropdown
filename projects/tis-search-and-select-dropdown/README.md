# tis-search-and-select-dropdown

A powerful Angular Material-based dropdown component library by **Thai Informatic Systems Co. Ltd.**, offering flexible and customizable search-select dropdowns for both **client-side** and **server-side** data. It supports **single** and **multiple selection**, rich configuration options, hints, refresh support, and create-new actions — all built for modern Angular apps.

[![npm version](https://img.shields.io/npm/v/@servicemind.tis/tis-search-and-select-dropdown)](https://www.npmjs.com/package/@servicemind.tis/tis-search-and-select-dropdown)
[![npm downloads](https://img.shields.io/npm/dm/@servicemind.tis/tis-search-and-select-dropdown)](https://www.npmjs.com/package/@servicemind.tis/tis-search-and-select-dropdown)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Features

- ✅ Single & Multiple selection modes
- ✅ Client-side and Server-side data filtering
- ✅ Searchable dropdown with custom filters
- ✅ Dynamic "Create New" action
- ✅ Hint messages & refresh button support
- ✅ Fully compatible with Angular Reactive Forms
- ✅ Material Design (Angular Material)

---

## 📦 Installation

```bash
npm install @servicemind.tis/tis-search-and-select-dropdown
```

### Required Peer Dependencies

```bash
npm install @angular/material @angular/cdk
```

---

## 🧩 Usage

### Module Setup

```ts
import { TisSearchAndSelectDropdownModule } from '@servicemind.tis/tis-search-and-select-dropdown';

@NgModule({
  imports: [TisSearchAndSelectDropdownModule]
})
export class MyFeatureModule {}
```

---

## 🧠 Components

### `<tis-client-side-dropdown>`
Use when the full dataset is available in memory.

### `<tis-server-side-dropdown>`
Use when dropdown options should be fetched dynamically from an API endpoint.

---

## 💡 Quick Example

```html
<form [formGroup]="form">
  <tis-client-side-dropdown
    type="single"
    label="Client Side Single"
    nameKey="email"
    valueKey="id"
    [data]="options1"
    [config]="config.singleClientSideSelect"
    formControlName="singleClientSideSelect"
    (selectedValueNamesUpdated)="setOptionFirstData($event)">
  </tis-client-side-dropdown>
</form>
```

---

## ⚙️ Configuration Object

Both client- and server-side components accept configuration inputs defined in the following structure:

| Property | Type | Description |
|----------|------|-------------|
| `uri` | `string \| null` | API endpoint (for server-side) |
| `method` | `string \| null` | HTTP method (GET, POST) |
| `limit` | `number \| null` | Max items to retrieve/display |
| `setFirstOption` | `boolean \| null` | Auto-select first option |
| `ifLengthOnlyOne` | `boolean \| null` | Auto-select if only one result |
| `filter` | `object \| null` | Payload filters for server request |
| `isAllOption` | `boolean` | Include "All" option |
| `isSearchable` | `boolean` | Enable client search filtering |
| `isEnableRefreshMode` | `boolean` | Show refresh button |
| `clickRefreshBtn` | `Function` | Callback for refresh click |
| `hint` | `Hint` | Inline help below the dropdown |
| `createNew` | `CreateNew` | Define custom action to add new options |
| `noEntriesFoundLabel` | `string` | Message when list is empty |
| `additionalName` | `AdditionalName` | Combine multiple fields for label |
| `dataValueKey` | `string` | Key path to extract data |

> Interfaces for these are exported and fully type-safe.

---

## 🔌 Inputs & Outputs

### Shared Inputs
- `type`: `'single' | 'multiple'`
- `label`: `string`
- `nameKey`: `string`
- `valueKey`: `string`
- `data`: `any[]` (optional for server-side)
- `config`: `ClientSide/ServerSide[Single|Multiple]SelectionConfig`
- `formControlName`: `string`
- `classes`: `string` (CSS classes)

### Output Events
- `(selectedValueNamesUpdated)`: Emits selected values or array depending on mode

---

## 📤 Real-World Example (Reactive Form)

```ts
this.form = new FormGroup({
  singleClientSideSelect: new FormControl('*'),
  multipleClientSideSelect: new FormControl('*'),
  singleServerSideSelect: new FormControl('*'),
  multipleServerSideSelect: new FormControl(null),
});
```

```ts
this.config = {
  singleClientSideSelect: {
    uri: 'https://api.freeapi.app/api/v1/public/randomusers',
    method: 'GET',
    limit: 100,
    isSearchable: true,
    isAllOption: true,
    hint: {
      msg: 'This is hint for example'
    },
    dataValueKey: 'data.data'
  },
  multipleServerSideSelect: {
    uri: 'https://mocki.io/v1/32ff3217-e809-442c-8e63-b4b0a8416325',
    method: 'GET',
    limit: 100,
    isSearchable: true,
    isAllOption: true,
    createNew: {
      label: 'Click here to add new.',
      color: 'green',
      clickBtn: () => window.open('https://www.google.com/', '_blank')
    }
  }
};
```

---

## 📦 Exported Types

- `ClientSideSingleSelectionConfig`
- `ClientSideMultipleSelectionConfig`
- `ServerSideSingleSelectionConfig`
- `ServerSideMultipleSelectionConfig`
- `SelectedFilterDisplayValueType`
- `SelectedFiltersGroupedValuesType`
- `ValidationMessages`

---

## 🎨 Styling

The library uses Angular Material components. Ensure you’ve included a Material theme:

```scss
@import "~@angular/material/prebuilt-themes/indigo-pink.css";
```

Custom styles can be added using the `classes` input.

---

## 🤝 Contributing

1. Clone the repository
2. Run `npm install`
3. Run `ng build tis-search-and-select-dropdown --watch`
4. Test changes via your demo app under `projects/`

---

## 📄 License

MIT License © Thai Informatic Systems Co. Ltd.

---

## 📬 Support / Questions

For bugs, suggestions, or feature requests, please open an issue on the [GitHub repository](https://github.com/Thai-Informatics-System/tis-search-and-select-dropdown) *(replace with actual link if available)*.

---

> Made with ❤️ by Thai Informatic Systems Co. Ltd.

