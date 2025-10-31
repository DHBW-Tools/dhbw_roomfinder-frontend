# API Example Data for DHBW Roomfinder

This folder contains example input/response files that follow the `DHBW_RF_BASIC_API.md` contract.

Files:

- `rooms-list.json` — example response for `GET /api/v1/rooms`.
- `room-A244.json` — example response for `GET /api/v1/rooms/{roomId}` with schedule.
- `room-A244-free.json` — example response for `GET /api/v1/rooms/{roomId}/free`.
- `rooms-nearest.json` — example response for `GET /api/v1/rooms/nearest`.
- `courses-list.json` — example response for `GET /api/v1/courses`.
- `course-KA001-rooms.json` — example response for `GET /api/v1/courses/{courseId}/rooms`.
- `room-A244-calendar.ics` — example iCalendar file for a room.
- `refresh-request.json` — example request body for `POST /api/v1/refresh`.
- `refresh-response.json` — example response for `POST /api/v1/refresh`.
- `status.json` — example response for `GET /api/v1/status`.
- `metrics.json` — example metrics in JSON form.

How to use

- Use these files for local development, mocks, or unit tests.
- To serve them locally for manual testing, copy them into your mock server or import them in tests.

Notes

- Dates are ISO8601; adjust to your timezone as needed.
- `room-A244-calendar.ics` is minimal; real calendars will include more properties.
