---
name: AccountCreatedEvent
version: 2023.3.0
summary: |
  Indicates that a new account has been created
producers:
  - OAuth2 User Service
consumers:
  - Activity Service
owners:
  - sbegaudeau
---

### Details

This event is fired when a new user has signed up using one OAuth2 provider.
We will create their Svalyn account using the data from their OAuth2 account.

<NodeGraph title="Consumer / Producer Diagram" />
