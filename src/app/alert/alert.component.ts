import { Component, trigger, state, style, transition, animate } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  animations: [
    trigger('alert', [
      transition(':enter', [
        style({
          marginTop: '-36px'
        }),
        animate('500ms ease-in-out', style({
          marginTop: 0
        }))
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({
          marginTop: '-36px'
        }))
      ])
    ])
  ]
})
export class AlertComponent {
  constructor() { }
}
