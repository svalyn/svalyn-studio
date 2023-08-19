/*
 * Copyright (c) 2023 Stéphane Bégaudeau.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useEffect } from 'react';
import { useCreateOrganization } from '../../new/useCreateOrganization';
import { CreateOrganizationInput } from '../../new/useCreateOrganization.types';
import { useDeleteOrganization } from '../../organizations/settings/useDeleteOrganization';
import { DeleteOrganizationInput } from '../../organizations/settings/useDeleteOrganization.types';
import { useCreateProject } from '../../organizations/useCreateProject';
import { CreateProjectInput } from '../../organizations/useCreateProject.types';
import { useConsole } from '../console/useConsole';
import {
  CreateOrganizationTaskRunnerProps,
  CreateProjectTaskRunnerProps,
  DeleteOrganizationTaskRunnerProps,
} from './TaskRunners.types';

export const CreateOrganizationTaskRunner = ({ task, onTaskCompleted }: CreateOrganizationTaskRunnerProps) => {
  const [createOrganization, { organization, message }] = useCreateOrganization();
  const { pushMessage } = useConsole();

  useEffect(() => {
    const input: CreateOrganizationInput = {
      id: crypto.randomUUID(),
      identifier: task.identifier,
      name: task.name,
    };
    createOrganization(input);
  }, []);

  useEffect(() => {
    if (organization) {
      pushMessage({ body: `The organization ${task.name} has been created`, severity: 'info' });
      onTaskCompleted('Success');
    } else if (message) {
      pushMessage(message);
      onTaskCompleted('Failure');
    }
  }, [organization, message]);

  return <div />;
};

export const DeleteOrganizationTaskRunner = ({ task, onTaskCompleted }: DeleteOrganizationTaskRunnerProps) => {
  const [deleteOrganization, { deleted, message }] = useDeleteOrganization();
  const { pushMessage } = useConsole();

  useEffect(() => {
    const input: DeleteOrganizationInput = {
      id: crypto.randomUUID(),
      organizationIdentifier: task.identifier,
    };
    deleteOrganization(input);
  }, []);

  useEffect(() => {
    if (deleted) {
      pushMessage({ body: `The organization ${task.identifier} has been deleted`, severity: 'info' });
      onTaskCompleted('Success');
    } else if (message) {
      pushMessage(message);
      onTaskCompleted('Failure');
    }
  }, [deleted, message]);

  return <div />;
};

export const CreateProjectTaskRunner = ({ task, onTaskCompleted }: CreateProjectTaskRunnerProps) => {
  const [createProjet, { project, message }] = useCreateProject();
  const { pushMessage } = useConsole();

  useEffect(() => {
    const input: CreateProjectInput = {
      id: crypto.randomUUID(),
      organizationIdentifier: task.organizationIdentifier,
      identifier: task.identifier,
      name: task.name,
      description: task.description,
    };
    createProjet(input);
  }, []);

  useEffect(() => {
    if (project) {
      pushMessage({ body: `The project ${task.name} has been created`, severity: 'info' });
      onTaskCompleted('Success');
    } else if (message) {
      pushMessage(message);
      onTaskCompleted('Failure');
    }
  }, [project, message]);

  return <div />;
};
