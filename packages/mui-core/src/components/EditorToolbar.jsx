import React, { useState } from 'react';
import { Toolbar, Button } from "@oce-editor-tools/base"
import { Box, ToggleButton, Popper } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AssignmentLate,
  AssignmentTurnedIn,
  Edit,
  Lock,
  LockOpen,
  Preview,
  Redo,
  Save,
  Print,
  Search,
  Subject,
  Undo,
  ViewStream,
} from '@mui/icons-material';

import { Extensible } from '@gwdevs/extensible-rcl';
import FindReplace from './FindReplace';

const ToolbarButton = styled(ToggleButton)({
  border: 'none',
  '&.Mui-disabled': {
    border: 'none',
  },
});

export function BrokenAlignmentsPopper(brokenAlignmentsPopperProps) {
  const { anchorEl, brokenAlignedWords } = brokenAlignmentsPopperProps;
  
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;
  return <Popper id={id} open={open} anchorEl={anchorEl}>
    <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
      List of words with broken alignment:
      <Box>
        {brokenAlignedWords &&
          brokenAlignedWords.map((str, i) => <li key={i}>{str}</li>)}
      </Box>
    </Box>
  </Popper>;
}

let brokenAlignedWords = []
export function EditorToolbar({ showToggles, onRenderToolbar }) {

  const [anchorEl, setAnchorEl] = useState(null);
  const openPopup = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  return (
    <Box
      sx={{
        mb: 1.5,
        position: 'sticky',
        top: 0,
        zIndex: 'appBar',
      }}
    >
      <Toolbar
        component={Box}
        sx={{
          width: 'fit-content',
          maxWidth: '100%',
          background: (theme) => theme.palette.background.default,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 1,
        }}
      >
        <Button.Editable component={ToolbarButton}>
          <Edit />
        </Button.Editable>
        {showToggles ? (
          <>
            <Button.Sectionable component={ToolbarButton}>
              <ViewStream />
            </Button.Sectionable>
            <Button.Blockable component={ToolbarButton}>
              <Subject />
            </Button.Blockable>
            <Button.Preview component={ToolbarButton}>
              <Preview />
            </Button.Preview>
          </>
        ) : null}
        <Extensible onRenderItems={onRenderToolbar}>
          <Button.Lock key="lock" component={ToolbarButton}>
            {({ selected }) => (selected ? <Lock /> : <LockOpen />)}
          </Button.Lock>
          <Button.AlignmentBroken key="alignmentBroken" component={ToolbarButton} onClick={openPopup}>
            {({ allAligned, brokenAlignedWords: b }) => {
              brokenAlignedWords = b;
              return allAligned ? <AssignmentTurnedIn /> : <AssignmentLate />;
            }}
          </Button.AlignmentBroken>
          <BrokenAlignmentsPopper anchorEl={anchorEl} brokenAlignedWords={brokenAlignedWords}/>
          <Button.Undo key="undo" component={ToolbarButton}>
            <Undo />
          </Button.Undo>
          <Button.Redo key="redo" component={ToolbarButton}>
            <Redo />
          </Button.Redo>
          <Button.Save key="save" component={ToolbarButton}>
            <Save />
          </Button.Save>
          <Button.Print key="print" component={ToolbarButton}>
            <Print />
          </Button.Print>
          <Button.Search key="search" component={ToolbarButton}>
            <Search />
          </Button.Search>
        </Extensible>
      </Toolbar>
      <Box>
        <FindReplace />
      </Box>
    </Box>
  );
}
