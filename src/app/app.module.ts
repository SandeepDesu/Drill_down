import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MapComponent } from './../pages/map/map.component';
import { MapService } from './../services/mapservice.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'map' },
  { path: 'map', component: MapComponent },
  { path: '**', redirectTo: 'map' }
];

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [MapService],
  bootstrap: [AppComponent]
})
export class AppModule { }
