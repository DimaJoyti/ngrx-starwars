import {Injectable} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  constructor(public snackBar: MatSnackBar) {}

  /**
   * Display info notification
   *
   * @param {string} text
   */
  public info(text: string) {
    this.snackBar.open(text, undefined, {
      duration: 10000
    });
  }

  /**
   * Display warning information
   *
   * @param {string} text
   */
  public warning(text: string) {
    this.snackBar.open(text, undefined, {
      duration: 10000
    });
  }
}
