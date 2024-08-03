export interface ITask {
    id: number;
    name: string;
    description: string;
    created: Date;
    status: string;
    workflowStatusId: number;
    typeOfWorkId: number;
    url: string;
    projectName: string;
    customerName: string;
    workflowStatusName: string;
    typeOfWorkName: string;
    allowedActions: {
        canModify: boolean;
        canDelete: boolean;
    };
    deadline: null | Date;
    estimatedTime: null | number;
    customerId: number;
    projectId: number;
}

export interface ITasksResponse {
    offset: number;
    limit: number;
    items: ITask[];
}
