---
name: ProjectDeletedEvent
version: 2023.3.0
summary: |
  Indicates that a project has been deleted
producers:
  - Project Deletion Service
consumers:
  - Activity Service
  - Notification Service
owners:
  - sbegaudeau
---

### Details

This event is fired when a project has been deleted.

<NodeGraph title="Consumer / Producer Diagram" />