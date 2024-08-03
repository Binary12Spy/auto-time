export interface IUserInfo {
    id: number;
    departmentId: number;
    timeZoneGroupId: number;
    hired: Date;
    releaseDate: Date;
    email: string;
    allowedActions: {
        canSubmitTimesheet: boolean;
    };
    fullName: string;
    username: string;
    active: boolean;
    firstName: string;
    middleName: string;
    lastName: string;
}