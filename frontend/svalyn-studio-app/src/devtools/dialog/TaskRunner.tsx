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

import { useState } from 'react';
import { useConsole } from '../console/useConsole';
import { Task } from '../tasks/Task.types';
import {
  CreateOrganizationTaskRunner,
  CreateProjectTaskRunner,
  DeleteOrganizationTaskRunner,
} from '../tasks/TaskRunners';
import { TaskRunnerProps, TaskRunnerState } from './TaskRunner.types';

export const TaskRunner = ({ tasks, onTaskCompleted }: TaskRunnerProps) => {
  const [state, setState] = useState<TaskRunnerState>({
    currentTaskIndex: 0,
  });

  const { pushMessage } = useConsole();

  const currentTask: Task | undefined = tasks[state.currentTaskIndex];

  const handleTaskCompleted = () => {
    if (state.currentTaskIndex === tasks.length - 1) {
      pushMessage({ body: 'All tasks completed', severity: 'success' });
      onTaskCompleted();
    } else {
      setState((prevState) => ({ ...prevState, currentTaskIndex: prevState.currentTaskIndex + 1 }));
    }
  };

  let currentTaskRunner: JSX.Element | null = null;
  if (currentTask) {
    if (currentTask.type === 'CreateOrganizationTask') {
      currentTaskRunner = (
        <CreateOrganizationTaskRunner
          key={state.currentTaskIndex}
          task={currentTask}
          onTaskCompleted={handleTaskCompleted}
        />
      );
    } else if (currentTask.type === 'DeleteOrganizationTask') {
      currentTaskRunner = (
        <DeleteOrganizationTaskRunner
          key={state.currentTaskIndex}
          task={currentTask}
          onTaskCompleted={handleTaskCompleted}
        />
      );
    } else if (currentTask.type === 'CreateProjectTask') {
      currentTaskRunner = (
        <CreateProjectTaskRunner
          key={state.currentTaskIndex}
          task={currentTask}
          onTaskCompleted={handleTaskCompleted}
        />
      );
    }
  }

  return currentTaskRunner;
};
