---
name: ChangeProposalIntegratedEvent
version: 2023.3.0
summary: |
  Indicates that a change proposal has been integrated
producers:
  - Change Proposal Update Service
consumers:
  - Activity Service
  - Change Proposal Integrated Event Listener
owners:
  - sbegaudeau
---

### Details

This event is fired when a change proposal has been integrated.

<NodeGraph title="Consumer / Producer Diagram" />