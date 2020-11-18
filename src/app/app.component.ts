import { Component, OnInit } from '@angular/core';
import { fromEvent, interval, merge, NEVER } from 'rxjs';
import { mapTo, scan, startWith, switchMap, tap } from 'rxjs/operators';

export interface IState {
  isPlaying: boolean;
  value: number;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
  ngOnInit(): void {
    const start$ = fromEvent(document.getElementById('start'), 'click');
    const stop$ = fromEvent(document.getElementById('pause'), 'click');
    const reset$ = fromEvent(document.getElementById('reset'), 'click');

    const stopWatch = merge(
      start$.pipe(mapTo({ isPlaying: true })),
      stop$.pipe(mapTo({ isPlaying: false })),
      reset$.pipe(mapTo({ value: 0, isPlaying: false }))
    ).pipe(
      startWith({
        isPlaying: false,
        value: 0
      }),
      scan((state: IState, curr): IState => ({ ...state, ...curr })),
      tap((state: IState) => setValue(state)),
      switchMap((state: IState) => state.isPlaying ?
        interval(1000).pipe(
          tap(_ => state.value += 1),
          tap(_ => setValue(state))
        ) : NEVER)
    );

    const setValue = (state: IState) => {
      console.log(state);
      if (state.isPlaying) {
        document.getElementById('start').innerHTML = 'start';
        document.getElementById('start').setAttribute('disabled', '');
      }
      else if (!state.isPlaying && state.value > 0) {
        document.getElementById('start').innerHTML = 'resume';
        document.getElementById('start').removeAttribute('disabled');
      }
      else {
        document.getElementById('start').innerHTML = 'start';
        document.getElementById('start').removeAttribute('disabled');
      }
      document.getElementById('counter').innerHTML = timerToString(state.value);
    };

    const timerToString = (val: number): string => {
      const seconds = Math.floor(val % 60) >= 10
        ? Math.floor(val % 60).toString() : `0${Math.floor(val % 60).toString()}`;
      const minutes = Math.floor(val / 60) >= 10
        ? Math.floor(val / 60).toString() : `0${Math.floor(val / 60).toString()}`;
      return `${minutes}:${seconds}`;
    };

    stopWatch.subscribe();
  }
}
