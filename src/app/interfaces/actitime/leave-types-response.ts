export interface ILeaveType {
	id: number;
	name: string;
	balance: string;
	archived: boolean;
}

export interface ILeaveTypesResponse {
	items: ILeaveType[];
	offset: number;
	limit: number;
}
