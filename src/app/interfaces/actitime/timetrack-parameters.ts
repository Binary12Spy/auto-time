export interface ITaskEntry {
    taskId: number;
    percentage: number;
}

export interface ILeaveEntry {
    leaveTypeId: number;
    minutes: number;
}

export class ITimeTrackParameters {
    tasks: ITaskEntry[];
    leaves: ILeaveEntry[];
    variancePercentage: number;

    constructor() {
        this.tasks = [];
        this.leaves = [];
        this.variancePercentage = .05;
    }

    verifyParameters(): boolean {
        // Check if the sum of the percentages of tasks is 100
        if (this.tasks.reduce((total, task) => total + task.percentage, 0) !== 100) {
            return false;
        }

        // Check if the sum of the minutes of leaves is greater than 480 per day
        if (this.leaves.reduce((total, leave) => total + leave.minutes, 0) > 480) {
            return false;
        }

        return true;
    }
}