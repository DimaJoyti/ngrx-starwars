import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ApiError {
  error: string;
  message: string;
  code: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Handle HTTP errors and show user-friendly messages
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let userMessage = 'Something went wrong. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      userMessage = 'Connection problem. Please check your internet connection.';
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'object') {
        const apiError = error.error as ApiError;
        errorMessage = apiError.message || apiError.error || 'Server error';
        userMessage = this.getUserFriendlyMessage(error.status, apiError);
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
        userMessage = this.getUserFriendlyMessage(error.status);
      }
    }

    // Log the error for debugging
    console.error('HTTP Error:', errorMessage, error);

    // Show user-friendly message
    this.showErrorMessage(userMessage);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get user-friendly error message based on HTTP status code
   */
  private getUserFriendlyMessage(status: number, apiError?: ApiError): string {
    if (apiError?.message) {
      return apiError.message;
    }

    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized to access this resource.';
      case 403:
        return 'Access forbidden. You don\'t have permission.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Show error message to user using snackbar
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Show success message to user
   */
  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show info message to user
   */
  showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }
}
