import { ITimeTrackParameters } from "./timetrack-parameters";

export interface ILeaveTime {
    leaveTypeId: number;
    minutes: number;
}

export interface ITaskTime {
    taskId: number;
    minutes: number;
}

export interface ITimeTrackDay {
    date: Date;
    sheduledMinutes: number;
    leaveTime: ILeaveTime[];
    taskTime: ITaskTime[];
}

export class ITimeTrack {
    startDate: Date;
    endDate: Date;
    days: ITimeTrackDay[];

    constructor() {
        this.startDate = new Date();
        this.endDate = new Date();
        this.days = [];
    }

    fromParameters(data: { startDate: string; endDate: string; parameters: ITimeTrackParameters }): void {
        this.startDate = this.parseDate(data.startDate);
        this.endDate = this.parseDate(data.endDate);
        this.days = this.convertDays(data.parameters);
    }
}