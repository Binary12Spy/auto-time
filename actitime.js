ACTITIME_BASE_URL = "https://online.actitime.com/your-company-here/api/v1"

USER_INFO_ENDPOINT = ACTITIME_BASE_URL + "/users/me"
TASKS_GET_ENDPOINT = ACTITIME_BASE_URL + "/tasks?offset=0&limit=1000&status=open"
LEAVE_TYPES_GET_ENDPOINT = ACTITIME_BASE_URL + "/leaveTypes?offset=0&limit=1000&archived=false"
SCHEDULE_GET_ENDPOINT = ACTITIME_BASE_URL + "/users/{user-id}/schedule?dateFrom={start-date}&dateTo={end-date}"
BATCH_ACTION_ENDPOINT = ACTITIME_BASE_URL + "/batch?includeResponseBody=always"

LEAVE_TIME_PATCH_RELATIVE_PATH = "/leavetime/{username}/{date}/{leaveTypeId}"
TIMETRACK_POST_RELATIVE_PATH = "/timetrack/{username}/{date}/{taskId}"

async function getActitimeUserInfo(username, password) {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
    };

    return fetch(USER_INFO_ENDPOINT, requestOptions)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                return false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });
}

async function getActitimeTasks(username, password) {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
    };

    tasks = await fetch(TASKS_GET_ENDPOINT, requestOptions)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                return false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });

    return formatActitimeTasks(tasks);
}

function formatActitimeTasks(tasks) {
    let formattedTasks = [];
    for (let task of tasks.items) {
        formattedTasks.push({
            id: task.id,
            name: task.name,
            project: task.customerName
        });
    }
    return formattedTasks;
}

async function getLeaveTypes(username, password) {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
    };

    return fetch(LEAVE_TYPES_GET_ENDPOINT, requestOptions)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                return false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });
}

async function getSchedule(username, password, userId, startDate, endDate) {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
    };

    const scheduleEndpoint = SCHEDULE_GET_ENDPOINT
        .replaceAll("{user-id}", userId)
        .replaceAll("{start-date}", startDate)
        .replaceAll("{end-date}", endDate);

    return fetch(scheduleEndpoint, requestOptions)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                return false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });
}

async function generateTimetrack(username, password, userId, startDate, endDate, tasks, leave) {
    if (startDate === "" || endDate === "") {
        alert("Please select a start and end date");
        return;
    }

    let schedule = await getSchedule(username, password, userId, startDate, endDate);
    let timetrack = [];

    // Loop from startDate to endDate
    let currentDate = new Date(startDate + "T00:00:00");
    let endDateObject = new Date(endDate + "T00:00:00");
    let iteration = 0;
    while (currentDate <= endDateObject) {
        let minutesScheduled = schedule.schedule[iteration];

        let today = { date: new Date(currentDate.getTime()), scheduledMinutes: minutesScheduled, tasks: [], leave: {} }

        // If the user has leave on this day, add it to the timetrack
        let leaveOnDay = leave.find(item => item.date === currentDate.toISOString().split("T")[0]);
        if (leaveOnDay) {
            today.leave = { id: parseInt(leaveOnDay.id), minutes: parseFloat(leaveOnDay.hours) * 60, name: leaveOnDay.name };
        }

        // Calculate any remaining scheduled minutes after adding leave
        minutesScheduled -= leaveOnDay ? leaveOnDay.hours * 60 : 0;
        // If the remaining scheduled minutes is 0, continue to the next day
        if (minutesScheduled === 0) {
            timetrack.push(today);
            currentDate.setDate(currentDate.getDate() + 1);
            iteration++;
            continue;
        }

        // Generate a timetrack based off the tasks and scheduled minutes
        let timetrackMinutes = convertPercentagesToRoundedMinutesWithVariance(tasks, minutesScheduled);
        for (let item of timetrackMinutes) {
            today.tasks.push({ task_id: item.task_id, minutes: item.minutes, name: item.name });
        }
        timetrack.push(today);
        currentDate.setDate(currentDate.getDate() + 1);
        iteration++;
    }

    return { "startDate": startDate, "endDate": endDate, "timetrack": timetrack };
}

function convertPercentagesToRoundedMinutesWithVariance(tasks, scheduledMinutes) {
    const resultList = [];
    const varianceRange = scheduledMinutes * 0.1;

    let totalPercentage = 0;
    for (let task of tasks) {
        totalPercentage += parseInt(task.percentage);
    }

    if (totalPercentage !== 100) {
        alert("Total percentage of tasks must equal 100");
        return;
    }

    for (let task of tasks) {
        const minutesWithoutVariance = Math.round((task.percentage / 100) * scheduledMinutes);

        // Generate a random variance within the range [-varianceRange/2, varianceRange/2]
        const variance = (Math.random() - 0.5) * varianceRange;
        const minutesWithVariance = Math.round(minutesWithoutVariance + variance);
        const roundedMinutes = roundToNearest15Minutes(minutesWithVariance);
        resultList.push({ task_id: parseInt(task.id), minutes: roundedMinutes, name: task.name });
    }

    // Calculate the total minutes in the result list
    const totalResultMinutes = resultList.reduce((sum, item) => sum + item.minutes, 0);

    // Calculate the variance and adjust the last item to make the total scheduledMinutes
    const variance = scheduledMinutes - totalResultMinutes;
    resultList[resultList.length - 1].minutes += variance;

    return resultList;
}

function roundToNearest15Minutes(minutes) {
    return Math.round(minutes / 15) * 15;
}

async function applyTimetrackToActitime(username, password, timetrack) {
    let bulkActitimePayload = compileTimetrackToBulkActitimePayloads(username, timetrack);

    let result = false;

    for (let payload of bulkActitimePayload) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        let response = await fetch(BATCH_ACTION_ENDPOINT, requestOptions)
            .then(response => {
                if (response.status === 200) {
                    result = true;
                    return response.json();
                } else {
                    result = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                result = false;
            });

        if (!result) {
            return false;
        }

        // Iterate through the response and check for errors
        for (let item of response) {
            if (item.status !== 200) {
                return false;
            }
        }
        return true;
    }
}

function compileTimetrackToBulkActitimePayloads(username, timetrack) {
    let bulkActitimePayload = [];
    let subActitimePayload = [];
    let iteration = 0;
    let iterationLimit = 1000;
    let iterationId = 0;
    for (let day of timetrack.timetrack) {
        // If the iteration limit is within 20 of the limit, add the sub payload to the bulk payload and reset the sub payload
        if (iteration >= iterationLimit - 20) {
            bulkActitimePayload.push(subActitimePayload);
            subActitimePayload = [];
            iteration = 0;
            iterationId++;
        }

        // If there is leave on this day, add it to the sub payload
        if (day.leave.minutes) {
            subActitimePayload.push({
                id: iterationId.toString(),
                method: "PATCH",
                relativeUrl: LEAVE_TIME_PATCH_RELATIVE_PATH
                    .replaceAll("{username}", username)
                    .replaceAll("{date}", day.date.toISOString().split("T")[0])
                    .replaceAll("{leaveTypeId}", day.leave.id),
                body: {
                    "leaveTime": day.leave.minutes
                }
            });
            iteration++;
            iterationId++;
        }

        // Add any tasks to the sub payload
        for (let task of day.tasks) {
            subActitimePayload.push({
                id: iterationId.toString(),
                method: "PATCH",
                relativeUrl: TIMETRACK_POST_RELATIVE_PATH
                    .replaceAll("{username}", username)
                    .replaceAll("{date}", day.date.toISOString().split("T")[0])
                    .replaceAll("{taskId}", task.task_id),
                body: {
                    "time": task.minutes,
                    "comment": ""
                }
            });
            iteration++;
            iterationId++;
        }

        // If this is the last day, add the sub payload to the bulk payload
        if (day.date.toISOString().split('T')[0] == timetrack.endDate) {
            bulkActitimePayload.push(subActitimePayload);
        }
    }
    return bulkActitimePayload;
}