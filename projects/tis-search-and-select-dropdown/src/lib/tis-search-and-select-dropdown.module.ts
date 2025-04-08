import { NgModule } from '@angular/core';
import { TisSearchAndSelectDropdownComponent } from './tis-search-and-select-dropdown.component';
import { TisClientSideDropdownComponent } from './tis-client-side-dropdown/tis-client-side-dropdown.component';
import { TisServerSideDropdownComponent } from './tis-server-side-dropdown/tis-server-side-dropdown.component';



@NgModule({
  declarations: [
    TisSearchAndSelectDropdownComponent,
    TisClientSideDropdownComponent,
    TisServerSideDropdownComponent
  ],
  imports: [
  ],
  exports: [
    TisSearchAndSelectDropdownComponent,
    TisClientSideDropdownComponent,
    TisServerSideDropdownComponent
  ]
})
export class TisSearchAndSelectDropdownModule { }
