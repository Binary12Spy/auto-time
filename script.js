SPINNER_HTML = `<div class="spinner-border" role="status"></div>`

TASK_SECTION_HEADER_HTML = `<h5 class="list-group-item list-group-item-action active" aria-current="true">{section-name}</h5>`
TASK_SECTION_ENTRY_HTML = `
<a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
    {task-name}
    <button class="btn btn-outline-primary" data-task-id="{task-id}" data-task-name="{task-name}" onclick="addTask(this)">+</button>
</a>
`

SELECTED_TASKS_HTML = `
<div class="input-group input-group-lg input-group-sm mb-3" data-task-id="{task-id}">
    <span class="input-group-text">{task-name}</span>
    <input type="number" class="form-control">
    <span class="input-group-text">%</span>
    <button class="btn btn-outline-secondary" type="button" onclick="removeTask(this)">&times;</button>
</div>
`

TIME_OFF_ENTRY_HTML = `
<div class="input-group input-group-lg input-group-sm mb-3" data-leavetype-id="{leavetype-id}" data-leave-hours="{leave-hours}" data-leave-date="{leave-date}" data-leave-name="{leavetype-name}">
    <span class="input-group-text">{leavetype-name}</span>
    <span class="input-group-text">{leave-hours} hrs</span>
    <span class="input-group-text">{leave-date}</span>
    <button class="btn btn-outline-danger" onclick="removeTimeOff(this)">&times;</button>
</div>
`

var CALENDAR

// When the page loads, show the authentication modal
$(document).ready(function () {
    var myModalEl = document.getElementById('calendarModal')
    myModalEl.addEventListener('shown.bs.modal', function () {
        CALENDAR.render();
    })

    var calendarEl = document.getElementById('calendar');
    CALENDAR = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth'
    });

    $('#authenticationModal').modal({
        backdrop: 'static',
        keyboard: false
    });
    $('#calendarModal').modal({
        backdrop: true,
        keyboard: true
    });
    $('#authenticationModal').modal('show');

    // If the user has already logged in, fill the username and password fields
    $('#actitimeUsername').val(sessionStorage.getItem("actitimeUsername"));
    $('#actitimePassword').val(sessionStorage.getItem("actitimePassword"));
});

$(document).keypress(function (e) {
    if ($("#authenticationModal").hasClass('show') && (e.keycode == 13 || e.which == 13)) {
        $("#btnAuthenticationModalSubmit").click()
    }
});

async function submitLoginModal() {
    // Set the submit button to a spinner
    authenticationModalButton = $("#btnAuthenticationModalSubmit");
    authenticationModalButton.html(SPINNER_HTML);

    // Get the username and password
    let username = $('#actitimeUsername').val();
    let password = $('#actitimePassword').val();

    // Submit username and password to actitime and get the response
    result = await getActitimeUserInfo(username, password);

    // If the response is false, show an error and return
    if (!result) {
        authenticationModalButton.html(authenticationModalButton.data("default-html"));
        $("#actitimeLoginErrorText").show(200);
        return;
    }

    // If the response is true, set session storage and hide the modal
    sessionStorage.setItem("actitimeUsername", username);
    sessionStorage.setItem("actitimePassword", password);
    sessionStorage.setItem("actitimeUserId", result.id);
    $('#authenticationModal').modal('hide');
    authenticationModalButton.html(authenticationModalButton.data("default-html"));

    // Fill User Info
    $("#userName").html("Welcome, " + result.firstName + "!");
    $("#userId").html("Actitime User ID: " + sessionStorage.getItem("actitimeUserId"));

    // Fill the leave type select
    fillLeaveTypes();

    // Fill the task select
    fillTaskSelect();
}

async function fillTaskSelect() {
    tasks = await getActitimeTasks(sessionStorage.getItem("actitimeUsername"), sessionStorage.getItem("actitimePassword"));
    taskList = $("#taskList");
    for (let task of tasks) {
        if (taskList.find(`h5:contains('${task.project}')`).length === 0) {
            taskList.append(TASK_SECTION_HEADER_HTML.replaceAll("{section-name}", task.project));
        }
        $("#taskList").append(TASK_SECTION_ENTRY_HTML.replaceAll("{task-name}", task.name).replaceAll("{task-id}", task.id));
    }
}

async function fillLeaveTypes() {
    leaveTypes = await getLeaveTypes(sessionStorage.getItem("actitimeUsername"), sessionStorage.getItem("actitimePassword"));
    leaveTypeSelect = $("#leaveTypeSelect");
    for (let leaveType of leaveTypes.items) {
        leaveTypeSelect.append(`<option value="${leaveType.id}">${leaveType.name}</option>`);
    }

}

function addTask(event) {
    let taskId = event.dataset.taskId;
    let taskName = event.dataset.taskName;

    selectedTasksList = $("#selectedTasks");
    selectedTasksList.append(SELECTED_TASKS_HTML.replaceAll("{task-name}", taskName).replaceAll("{task-id}", taskId));
}

function removeTask(event) {
    event.parentElement.remove();
}

function addTimeOff() {
    let leaveTypeId = $("#leaveTypeSelect").val();
    let leaveTypeName = $("#leaveTypeSelect option:selected").text();
    let leaveHours = $("#leaveHours").val();
    let leaveDate = $("#leaveDate").val();

    $("#leaveTimeList").append(TIME_OFF_ENTRY_HTML.replaceAll("{leavetype-id}", leaveTypeId).replaceAll("{leavetype-name}", leaveTypeName).replaceAll("{leave-hours}", leaveHours).replaceAll("{leave-date}", leaveDate));
}

function removeTimeOff(event) {
    event.parentElement.remove();
}

var TIMETRACK

async function generateTime() {
    let userId = sessionStorage.getItem("actitimeUserId");
    let timeTrackStartDate = $("#startDate").val();
    let timeTrackEndDate = $("#endDate").val();
    let tasks = collectTasks();
    let leavetime = collectLeavetime();

    TIMETRACK = await generateTimetrack(sessionStorage.getItem("actitimeUsername"), sessionStorage.getItem("actitimePassword"), userId, timeTrackStartDate, timeTrackEndDate, tasks, leavetime);
    if (!TIMETRACK) {
        return;
    }
    updateCalendarWithTimetrack(TIMETRACK);
    $("#calendarModal").modal("show");
    CALENDAR.gotoDate(timeTrackStartDate);
}

function collectTasks() {
    let tasks = [];
    for (let task of $("#selectedTasks").children()) {
        tasks.push({
            id: task.dataset.taskId,
            percentage: task.children[1].value,
            name: task.children[0].innerText
        });
    }
    return tasks;
}

function collectLeavetime() {
    let leavetime = [];
    for (let leave of $("#leaveTimeList").children()) {
        leavetime.push({
            id: leave.dataset.leavetypeId,
            hours: leave.dataset.leaveHours,
            date: leave.dataset.leaveDate,
            name: leave.dataset.leaveName
        });
    }
    return leavetime;
}

function updateCalendarWithTimetrack(timetrack) {
    let [eyear, emonth, eday] = timetrack.endDate.split("-").map(Number);
    timeTrackEndDate = new Date(eyear, emonth - 1, eday);
    CALENDAR.removeAllEvents();
    let firstDateOff
    for (let entry of timetrack.timetrack) {
        // Check if entry has 0 minutes scheduled
        if (entry.scheduledMinutes === 0) {
            // If the firstDateOff is not set, set it to the current entry date
            if (!firstDateOff) {
                firstDateOff = entry.date;
            }
            // If this is the last entry, add the event to the calendar
            if (entry.date.getDate() == timeTrackEndDate.getDate()) {
                CALENDAR.addEvent({
                    title: "Non-working",
                    start: firstDateOff,
                    end: new Date(entry.date.getFullYear(), entry.date.getMonth(), entry.date.getDate() + 1),
                    allDay: true,
                    className: "bg-secondary"
                });
            }
            continue;
        }

        // If the firstDateOff is set, add it to the calendar
        if (firstDateOff) {
            CALENDAR.addEvent({
                title: "Non-working",
                start: firstDateOff,
                end: entry.date,
                allDay: true,
                className: "bg-secondary"
            });
            firstDateOff = undefined;
        }

        // Add any leave to the calendar
        if (entry.leave.name) {
            CALENDAR.addEvent({
                title: entry.leave.name + " | " + entry.leave.minutes / 60 + " hrs",
                start: entry.date,
                allDay: true,
                backgroundColor: "#633799",
            });
        }

        // Add any tasks to the calendar
        for (let task of entry.tasks) {
            CALENDAR.addEvent({
                title: task.name + " | " + task.minutes / 60 + " hrs",
                start: entry.date,
                end: entry.date,
                allDay: true,
                className: "bg-success"
            });
        }
    }
}

async function applyTimeTrack() {
    if (confirm("Are you sure you want to apply this timetrack?")) {
        let result = await applyTimetrackToActitime(sessionStorage.getItem("actitimeUsername"), sessionStorage.getItem("actitimePassword"), TIMETRACK);
        if (result) {
            alert("Timetrack applied successfully!");
            $("#calendarModal").modal("hide");
        }
        else {
            alert("Timetrack failed to apply!");
        }
    }
    else {
        $("#calendarModal").modal("hide");
    }
}