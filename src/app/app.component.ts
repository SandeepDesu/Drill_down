import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public isChrome: boolean = false;
  ngOnInit() {
    this.isChrome = ((window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1) && (window.navigator.vendor.toLowerCase().indexOf("google") > -1));
  }
}
