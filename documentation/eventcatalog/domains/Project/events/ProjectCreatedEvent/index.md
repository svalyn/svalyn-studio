---
name: ProjectCreatedEvent
version: 2023.3.0
summary: |
  Indicates that a new project has been created
producers:
  - Project Creation Service
consumers:
  - Activity Service
  - Notification Service
owners:
  - sbegaudeau
---

### Details

This event is fired when a new project has been created.

<NodeGraph title="Consumer / Producer Diagram" />