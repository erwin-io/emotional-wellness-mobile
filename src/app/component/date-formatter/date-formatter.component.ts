/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-date-formatter',
  templateUrl: './date-formatter.component.html',
  styleUrls: ['./date-formatter.component.scss'],
})
export class DateFormatterComponent implements OnInit {
  @Input("date") date: any | Date = new Date();
  @Input("format") format: string = "";
  constructor() { }

  get enableUTC() {
    return environment.production;
  }

  ngOnInit() {}

}
