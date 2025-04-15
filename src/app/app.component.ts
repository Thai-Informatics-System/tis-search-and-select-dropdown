import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ClientSideMultipleSelectionConfig, ClientSideSingleSelectionConfig, SelectedFilterDisplayValuesType, SelectedFilterDisplayValueType, ServerSideMultipleSelectionConfig, ServerSideSingleSelectionConfig, TisSearchAndSelectDropdownModule } from 'tis-search-and-select-dropdown';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, TisSearchAndSelectDropdownModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tis-ng-search-and-select-dropdown';
  form!: FormGroup;
  options1: any[] = [
    {id: 1, name: "Option 01"},
    {id: 2, name: "Option 02"},
    {id: 3, name: "Option 03"},
    {id: 4, name: "Option 04"},
    {id: 5, name: "Option 05"},
    {id: 6, name: "Option 06"},
  ];

  options2: any[] = [];
  options3: any[] = [];
  options4: any[] = [];
  options5: any[] = [];

  options1Data: any;
  options2Data: any;
  options3Data: any;
  options4Data: any;

  config = {
    singleClientSideSelect: <ClientSideSingleSelectionConfig>{
      uri: 'https://api.freeapi.app/api/v1/public/randomusers',
      method: 'GET',
      limit: 100,
      setFirstOption: false,
      isSearchable: true,
      isAllOption: true,
      isEnableRefreshMode: false,
      dataValueKey: 'data.data',
      hint: {
        msg: 'This is hint for example'
      }
    },
    multipleClientSideSelect: <ClientSideMultipleSelectionConfig>{
      uri: 'https://mocki.io/v1/32ff3217-e809-442c-8e63-b4b0a8416325',
      method: 'GET',
      limit: 100,
      setFirstOption: false,
      isSearchable: true,
      isAllOption: true,
      isEnableRefreshMode: false,
      hint: {
        label: 'Note',
        msg: 'This is note for example'
      }
    },
    singleServerSideSelect: <ServerSideSingleSelectionConfig>{
      uri: 'https://mocki.io/v1/32ff3217-e809-442c-8e63-b4b0a8416325',
      method: 'GET',
      limit: 100,
      setFirstOption: false,
      isSearchable: true,
      isAllOption: true,
      isEnableRefreshMode: false,
      hint: {
        color: 'green',
        label: 'Note',
        msg: 'This is note for example with customize color'
      }
    },
    multipleServerSideSelect: <ServerSideMultipleSelectionConfig>{
      uri: 'https://mocki.io/v1/32ff3217-e809-442c-8e63-b4b0a8416325',
      method: 'GET',
      limit: 100,
      setFirstOption: false,
      isSearchable: true,
      isAllOption: true,
      isEnableRefreshMode: false,
      createNew: {
        label: "Click here to add new.",
        color: 'green',
        clickBtn: this.createNew.bind(this)
      }
    },
    singleClientSideSelectWithTags: <ClientSideSingleSelectionConfig>{
      uri: 'https://mocki.io/v1/307d639d-b36e-4507-ba02-fc2dfe39fb25',
      method: 'GET',
      limit: 100,
      setFirstOption: false,
      isSearchable: true,
      isAllOption: false,
      isEnableRefreshMode: false,
      badge: {
        key: 'residentTypes',
        classConditionList: [
          { key: 1, value: "Owner", class: 'tis-badge-outline-primary' },
          { key: 2, value: "Resident", class: 'tis-badge-outline-success' },
          { key: 3, value: "Tenant", class: 'tis-badge-outline-accent' },
        ]
      }
    }
  }

  ngOnInit() {
    this.form = new FormGroup({
      singleClientSideSelect: new FormControl('*'),
      multipleClientSideSelect: new FormControl('*'),
      singleServerSideSelect: new FormControl('*'),
      multipleServerSideSelect: new FormControl(null),
      singleClientSideSelectWithTags: new FormControl(null),
    });
  }

  setOptionFirstData(values: SelectedFilterDisplayValueType | SelectedFilterDisplayValuesType) {
    this.options1Data = values;
  }

  setOptionSecondData(values: SelectedFilterDisplayValueType | SelectedFilterDisplayValuesType) {
    this.options2Data = values;
  }

  setOptionThirdData(values: SelectedFilterDisplayValueType | SelectedFilterDisplayValuesType) {
    this.options3Data = values;
  }

  setOptionFourthData(values: SelectedFilterDisplayValueType | SelectedFilterDisplayValuesType) {
    this.options4Data = values;
  }

  createNew(){
    window.open('https://www.google.com/', '_blank');
  }
}
