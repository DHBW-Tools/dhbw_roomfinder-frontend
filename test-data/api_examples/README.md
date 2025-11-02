# API Test Data Examples

This directory contains example JSON and iCalendar files for testing the DHBW Room Finder API endpoints. The data is organized into subdirectories for easier navigation:

## Directory Structure

```
api_examples/
├── rooms/           # Room-related endpoints
│   ├── rooms-list.json
│   ├── rooms-nearest.json
│   ├── room-{id}.json
│   ├── room-{id}-free.json
│   └── room-{id}-calendar.ics
├── courses/         # Course-related endpoints
│   ├── courses-list.json
│   └── course-{id}-rooms.json
├── system/          # System and admin endpoints
│   ├── status.json
│   ├── metrics.json
│   ├── refresh-request.json
│   └── refresh-response.json
└── README.md
```

## Coverage

The example data covers buildings A through F with 60 total rooms across multiple floors. Representative detail files are provided for rooms in each building (A244, B101, C301, D110, E210, F001).

## Usage

These files are served by the mock API server (`test-mock-server/server.mjs`) during development. See the mock server README for endpoint mappings and usage instructions.
