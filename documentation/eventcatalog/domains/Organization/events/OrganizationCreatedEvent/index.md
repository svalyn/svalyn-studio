---
name: OrganizationCreatedEvent
version: 2023.3.0
summary: |
  Indicates that a new organization has been created
producers:
  - Organization Creation Service
consumers:
  - Activity Service
  - Notification Service
owners:
  - sbegaudeau
---

### Details

This event is fired when a new organization has been created.

<NodeGraph title="Consumer / Producer Diagram" />