INSERT INTO account (id, provider, provider_id, role, username, password, name, email, image_url, created_on, last_modified_on) VALUES
('7ba7bda7-13b9-422a-838b-e45a3597e952', 'github', '000001', 'USER', 'johndoe', '', 'John Doe', 'johndoe@example.org', 'https://www.example.org/image/avatar.png', '2022-09-17 21:37:52.616', '2022-09-17 21:37:52.616');

INSERT INTO account (id, provider, provider_id, role, username, password, name, email, image_url, created_on, last_modified_on) VALUES
('1116f75f-2ceb-43cf-b6a6-c11dabbc5977', 'github', '000002', 'USER', 'janedoe', '', 'Jane Doe', 'janedoe@example.org', 'https://www.example.org/image/avatar.png', '2022-09-25 14:25:52.616', '2022-09-25 14:25:52.616');

INSERT INTO account (id, provider, provider_id, role, username, password, name, email, image_url, created_on, last_modified_on) VALUES
('5e45aead-48f2-462b-a50e-1191ace697bd', 'github', '000003', 'USER', 'julesdoe', '', 'Jules Doe', 'julesdoe@example.org', 'https://www.example.org/image/avatar.png', '2022-09-27 08:25:52.616', '2022-09-27 08:25:52.616');

INSERT INTO account (id, provider, provider_id, role, username, password, name, email, image_url, created_on, last_modified_on) VALUES
('a685c7d7-b4a4-4d58-8f76-ef05e6392fe4', 'github', '000004', 'USER', 'jamesdoe', '', 'James Doe', 'jamesdoe@example.org', 'https://www.example.org/image/avatar.png', '2022-09-28 17:29:52.616', '2022-09-28 17:29:52.616');


INSERT INTO organization (id, identifier, name, created_by, created_on, last_modified_by, last_modified_on) VALUES
('a9261e91-fb20-4d48-8731-d5297e441315', 'mockorganization', 'Mock Organization', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-09-17 22:38:19.331943', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-09-17 22:38:19.331943');

INSERT INTO membership (id, organization_id, member_id, "role", created_by, created_on, last_modified_by, last_modified_on) VALUES
('a2bed581-9661-41bf-9217-2870a9dce67c', 'a9261e91-fb20-4d48-8731-d5297e441315', '7ba7bda7-13b9-422a-838b-e45a3597e952', 'ADMIN', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-01 22:19:26.324164', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-01 22:19:26.324164');

INSERT INTO membership (id, organization_id, member_id, "role", created_by, created_on, last_modified_by, last_modified_on) VALUES
('65e7f962-4e7e-4738-978e-ac58ab02d6a5', 'a9261e91-fb20-4d48-8731-d5297e441315', '1116f75f-2ceb-43cf-b6a6-c11dabbc5977', 'MEMBER', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-02 11:25:26.324164', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-02 11:25:26.324164');

INSERT INTO invitation (id, organization_id, member_id, created_by, created_on, last_modified_by, last_modified_on) VALUES
('c3d41db3-02f1-4cec-8d7f-48e8f5eafe2f', 'a9261e91-fb20-4d48-8731-d5297e441315', '5e45aead-48f2-462b-a50e-1191ace697bd', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-02 14:12:26.324164', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-02 14:12:26.324164');

INSERT INTO project (id, identifier, name, description, read_me, organization_id, created_by, created_on, last_modified_by, last_modified_on) VALUES
('c0167908-8030-4679-a855-c057012ef27c', 'mockproject', 'Mock Project', 'Project description', 'README', 'a9261e91-fb20-4d48-8731-d5297e441315', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-06 23:22:18.863949', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-06 23:22:18.863949');

INSERT INTO resource (id, name, content, created_by, created_on, last_modified_by, last_modified_on) VALUES
('7f67d4a4-c74e-4dee-94ae-29ac7ebc3d43', 'test.txt', decode('013d7d16d7ad4fefb61bd95b765c8ceb', 'hex'), '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-17 21:18:19.331943', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-17 21:18:19.331943');

INSERT INTO resource (id, name, content, created_by, created_on, last_modified_by, last_modified_on) VALUES
('8d3ac60f-e6e6-4bcc-b795-19f909fe5142', 'test1.txt', decode('013d7d16d7ad4fefb61bd95b765c8ceb', 'hex'), '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-22 08:11:25.331943', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-22 08:11:25.331943');

INSERT INTO resource (id, name, content, created_by, created_on, last_modified_by, last_modified_on) VALUES
('ee466a5c-2b20-42d1-b442-c72b0f33833c', 'test2.txt', decode('013d7d16d7ad4fefb61bd95b765c8ceb', 'hex'), '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-23 18:11:25.331943', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-23 18:11:25.331943');

INSERT INTO change_proposal (id, name, read_me, status, project_id, created_by, created_on, last_modified_by, last_modified_on) VALUES
('60dd31a6-7e0c-47e9-af9f-b290e383822d', 'Initial contribution', 'README', 'OPEN', 'c0167908-8030-4679-a855-c057012ef27c', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-22 23:34:21.212', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-22 23:34:21.212');

INSERT INTO change_proposal_resource (id, resource_id, change_proposal_id) VALUES
('894e6af5-3ad6-4d81-955a-261f2448a403', '7f67d4a4-c74e-4dee-94ae-29ac7ebc3d43', '60dd31a6-7e0c-47e9-af9f-b290e383822d');

INSERT INTO change_proposal (id, name, read_me, status, project_id, created_by, created_on, last_modified_by, last_modified_on) VALUES
('40cab43e-0de8-48a3-bc95-b3836ea7781c', 'Second contribution', 'README', 'OPEN', 'c0167908-8030-4679-a855-c057012ef27c', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-23 23:34:21.212', '7ba7bda7-13b9-422a-838b-e45a3597e952', '2022-10-23 23:34:21.212');

INSERT INTO change_proposal_resource (id, resource_id, change_proposal_id) VALUES
('5a037854-2edf-4fbe-aa71-16ea786d27be', '8d3ac60f-e6e6-4bcc-b795-19f909fe5142', '40cab43e-0de8-48a3-bc95-b3836ea7781c');

INSERT INTO change_proposal_resource (id, resource_id, change_proposal_id) VALUES
('94c1bf69-1099-48a7-bec2-71782e7eaf20', 'ee466a5c-2b20-42d1-b442-c72b0f33833c', '40cab43e-0de8-48a3-bc95-b3836ea7781c');
