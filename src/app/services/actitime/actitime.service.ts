import { Injectable } from '@angular/core';

import { IUserInfo } from '../../interfaces/actitime/user-info';
import { ITasksResponse } from '../../interfaces/actitime/tasks-response';
import { ILeaveTypesResponse } from '../../interfaces/actitime/leave-types-response';
import { ISchedule } from '../../interfaces/actitime/schedule';

@Injectable({
	providedIn: 'root'
})
export class ActitimeService {
	private _companyId: string = "";
	private _username: string = "";
	private _token: string = "";

	constructor() {}

	set companyId(value: string) {
		if (value === "") {
			return;
		}
		this._companyId = value;
	}

	private get _baseUrl(): string {
		return `https://online.actitime.com/${this._companyId}/api/v1`;
	}

	async verifyCredentialsAsync(username: string, password: string): Promise<boolean> {
		let url = `${this._baseUrl}/info`;
		// Tokenize the username and password
		this._token = btoa(`${username}:${password}`);
		// Set the headers
		let headers = new Headers();
		headers.append("Authorization", `Basic ${this._token}`);
		// Return request
		return fetch(url, {
			method: "GET",
			headers: headers
		}).then(response => {
			// Check if the response is OK
			if (response.ok) {
				// Set the token and username
				this._token = btoa(`${username}:${password}`);
				this._username = username;
				return true;
			}
			// If not
			return false;
		}).catch(error => {
			console.error(error);
			return false;
		}) as Promise<boolean>;
	}

	async getMyUserInfoAsync(): Promise<IUserInfo> {
		let url = `${this._baseUrl}/users/me`;
		// Set the headers
		let headers = new Headers();
		headers.append("Authorization", `Basic ${this._token}`);
		// Return request
		return fetch(url, {
			method: "GET",
			headers: headers
		}).then(response => {
			// Check if the response is OK
			if (response.ok) {
				// Return the response as IUserInfo
				return response.json() as Promise<IUserInfo>;
			}
			// If not
			return null;
		}).catch(error => {
			console.error(error);
			return null;
		}) as Promise<IUserInfo>;
	}

	async getTasksAsync(offset: number = 0, limit: number = 1000, completed: boolean = true): Promise<ITasksResponse> {
		let url = `${this._baseUrl}/tasks`;
		url += `?offset=${offset}&limit=${limit}&status=${!completed ? "open" : "completed"}`;
		// Set the headers
		let headers = new Headers();
		headers.append("Authorization", `Basic ${this._token}`);
		// Return request
		return fetch(url, {
			method: "GET",
			headers: headers
		}).then(response => {
			// Check if the response is OK
			if (response.ok) {
				// Return the response as ITasksResponse
				return response.json() as Promise<ITasksResponse>;
			}
			// If not
			return null;
		}).catch(error => {
			console.error(error);
			return null;
		}) as Promise<ITasksResponse>;
	}

	async getLeaveTypesAsync(offset: number = 0, limit: number = 1000, archived: boolean = false): Promise<ILeaveTypesResponse> {
		let url = `${this._baseUrl}/leaveTypes`;
		url += `?offset=${offset}&limit=${limit}&archived=${archived}`;
		// Set the headers
		let headers = new Headers();
		headers.append("Authorization", `Basic ${this._token}`);
		// Return request
		return fetch(url, {
			method: "GET",
			headers: headers
		}).then(response => {
			// Check if the response is OK
			if (response.ok) {
				// Return the response as ILeaveTypesResponse
				return response.json() as Promise<ILeaveTypesResponse>;
			}
			// If not
			return null;
		}).catch(error => {
			console.error(error);
			return null;
		}) as Promise<ILeaveTypesResponse>;
	}

	async getSchedulesAsync(dateFrom: Date, dateTo: Date): Promise<ISchedule> {
		let url = `${this._baseUrl}/users/${this._username}/schedule`;
		url += `?dateFrom=${dateFrom.toISOString().split('T')[0]}`;
		url += `&dateTo=${dateTo.toISOString().split('T')[0]}`;
		// Set the headers
		let headers = new Headers();
		headers.append("Authorization", `Basic ${this._token}`);
		// Return request
		return fetch(url, {
			method: "GET",
			headers: headers
		}).then(response => {
			// Check if the response is OK
			if (response.ok) {
				// Return the response as ISchedule
				return response.json().then(data => new ISchedule(data)) as Promise<ISchedule>;
			}
			// If not
			return null;
		}).catch(error => {
			console.error(error);
			return null;
		}) as Promise<ISchedule>;
	}
}
