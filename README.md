# Auto-Time

A project that:
1. Interfaces with [Actitime](https://www.actitime.com/)'s open [REST API](https://online.actitime.com/your-company-here/api/v1/swagger) endpoints
1. Generates times for selected tasks with a (currently hardcoded) variance based off % of time share each task has in your 8 hour day
1. Accepts time off based on a float value of hours
1. Generates a "Timetrack" schedule within a given date range, respecting company holidays and your entered time off, based upon the entered time share between selected tasks
1. Previews the generated schedule on a fancy little calendar
1. If the user chooses, also applies the generated Timetrack schedule to Actitime automagically

### Setup

Auto-Time consists of static HTML, CSS, and JS files. Simply modify the `ACTITIME_BASE_URL` constant in `actitime.js` to match your company's URL and host the static files with the http(s) server of your choice.  

For the quickest spin up simply run `py -m http.server` in the Auto-Time directory and navigate to `http://localhost:{port-noted-in-your-terminal}`  

Actitime uses HTTP Basic authentication for it's REST API endpoints so the goal of this project was to keep all data entered in the browser.
Currently the entered Actitime credentials are stored plain text in the browsers Session Storage for use bwteen API calls, all other information exists in ram.

### Actitime endpoints used

1. GET `/users/me`
    * When the user submits thier Actitime credentials, we validate them with this endpoint and also retireve the Actitime UserID which will be needed for a later endpoint

1. GET `/leaveTypes`
    * Query params: `offset=0&limit=1000&archived=false`
    * Retrns the leave types for your organization

1. GET `/users/{uid}/schedule`
    * Query params: `dateFrom={start-date}&dateTo={end-date}`
    * Returns the uses scheduled minutes from a defined start date and end date. This data is used to determine corporarte holidays and otherwise non-working days

1. GET `/tasks`
    * Query params: `offset=0&limit=1000&status=open`
    * Returns all tasks available to user. Auto-Time groups these under the "CustomerName" field.

1. POST `/batch`
    * Query params: `includeResponseBody=always`
    * Used to apply the generated Timetrack shcedule.
