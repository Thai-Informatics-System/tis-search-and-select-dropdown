import { NgModule } from '@angular/core';
import { TisSearchAndSelectDropdownComponent } from './tis-search-and-select-dropdown.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TisServerSideDropdownComponent } from './tis-server-side-dropdown/tis-server-side-dropdown.component';
import { TisClientSideDropdownComponent } from './tis-client-side-dropdown/tis-client-side-dropdown.component';
import { SingleSelectComponent } from './tis-client-side-dropdown/single-select/single-select.component';
import { MultipleSelectComponent } from './tis-client-side-dropdown/multiple-select/multiple-select.component';
import { SelectSingleComponent } from './tis-server-side-dropdown/select-single/select-single.component';
import { SelectMultipleComponent } from './tis-server-side-dropdown/select-multiple/select-multiple.component';
import { MatSelectSearchComponent } from './mat-select-search/mat-select-search.component';



const uiImports = [
  MatTooltipModule,
  MatIconModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatButtonModule,
];

@NgModule({
  declarations: [
    TisSearchAndSelectDropdownComponent,
    TisClientSideDropdownComponent,
    TisServerSideDropdownComponent,
    SingleSelectComponent,
    MultipleSelectComponent,
    MatSelectSearchComponent,
    SelectSingleComponent,
    SelectMultipleComponent
  ],
  providers: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
    ...uiImports
  ],
  exports: [
    TisSearchAndSelectDropdownComponent,
    TisClientSideDropdownComponent,
    TisServerSideDropdownComponent
  ]
})
export class TisSearchAndSelectDropdownModule { }
