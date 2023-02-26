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

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import { Tab } from './Tab';
import { TabBarProps } from './TabBar.types';

export const TabBar = ({ resources, currentResourceId, onOpen, onClose }: TabBarProps) => {
  const currentResource = resources.find((resource) => resource.id === currentResourceId);
  return (
    <Box>
      <Box
        data-testid="tab-area"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflow: 'auto',
          flex: 'none',
          backgroundColor: (theme) => theme.palette.background.default,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          minHeight: '35px',
        }}
      >
        {resources.map((resource) => (
          <Tab
            key={resource.id}
            resource={resource}
            currentResourceId={currentResourceId}
            onOpen={onOpen}
            onClose={onClose}
          />
        ))}
      </Box>
      {currentResource ? (
        <>
          <Breadcrumbs
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              px: (theme) => theme.spacing(2),
              minHeight: '22px',
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
            separator="/"
            aria-label="breadcrumb"
            data-testid="tab-breadcrumb"
          >
            {[...currentResource.path.split('/'), currentResource.name].map((segment, index) => (
              <Typography
                key={index}
                variant="tbody"
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
              >
                {segment}
              </Typography>
            ))}
          </Breadcrumbs>
          <Box sx={{ height: '3px', boxShadow: 'rgba(106, 115, 125, 0.1) 0px 6px 6px -6px inset' }} />
        </>
      ) : null}
    </Box>
  );
};
