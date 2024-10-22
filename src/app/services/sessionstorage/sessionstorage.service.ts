import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

	constructor() { }

  public setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  public getItem(key: string): string {
    return sessionStorage.getItem(key) || "";
  }

  public removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }
}
