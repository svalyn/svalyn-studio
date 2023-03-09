---
name: ChangeProposalCreatedEvent
version: 2023.3.0
summary: |
  Indicates that a new change proposal has been created
producers:
  - Change Proposal Creation Service
consumers:
  - Activity Service
  - Notification Service
owners:
  - sbegaudeau
---

### Details

This event is fired when a new change proposal has been created.

<NodeGraph title="Consumer / Producer Diagram" />