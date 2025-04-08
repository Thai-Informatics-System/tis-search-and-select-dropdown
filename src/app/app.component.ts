import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TisSearchAndSelectDropdownModule } from 'tis-search-and-select-dropdown';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TisSearchAndSelectDropdownModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tis-ng-search-and-select-dropdown';
}
