export interface IScheduleEntry {
    date: Date;
    minutes: number;
}

export class ISchedule {
    dateFrom: Date;
    dateTo: Date;
    schedule: IScheduleEntry[];

    constructor(data: { dateFrom: string; dateTo: string; schedule: number[] }) {
        this.dateFrom = this.parseDate(data.dateFrom);
        this.dateTo = this.parseDate(data.dateTo);
        this.schedule = this.convertSchedule(data);
    }

    private parseDate(dateString: string): Date {
        const [year, month, day] = dateString.split('-').map(Number);
        // Note: JavaScript Date month is 0-based, so we subtract 1 from the month
        return new Date(year, month - 1, day);
    }

    private convertSchedule(data: { dateFrom: string; dateTo: string; schedule: number[] }): IScheduleEntry[] {
        const schedule: IScheduleEntry[] = [];

        for (let i = 0; i < data.schedule.length; i++) {
            const currentDate = new Date(this.dateFrom);
            currentDate.setDate(currentDate.getDate() + i);
            schedule.push({ date: currentDate, minutes: data.schedule[i] });
        }

        return schedule;
    }
}

