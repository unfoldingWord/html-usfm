# BookPreview demo

```js
import { usfmText } from '../data/John.usfm.de.js'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

function Component () {
  const renderFlags = {
    showTitles: false,
    showChapterLabels: true,
    showVersesLabels: true,
    showWordAtts: false,
    showHeadings: false,
    showIntroductions: false,
    showFootnotes: false,
    showXrefs: false,
    showParaStyles: true,
    showCharacterMarkup: true,
  };

  const onRenderItem = (props) => {
    const {verseId, extInfo} = props
    const {messageStr,color} = extInfo
    return (
      <span
        key={`update-from-master-${verseId}`}
        variant="contained"
        value="update-from-master"
        color={color}
        title={messageStr}
        aria-label={verseId}
        style={{ cursor: 'pointer' }}
      ><ErrorOutlineIcon/> Conflict! </span>
    )
  }

  const bcvFilter = {
    book: { 
      jhn: {
        ch: { 
          1: { 
            v: { 1: {}, 2: {}, 3: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 20: {}, 21: {} } 
          },
          3: {} 
        } 
      } 
    } 
  }

  const extInfo = {
    book: {
      jhn: {
        ch: {
          1: { 
              v: {
                7: { 
                  color: 'success',
                  onRenderItem,
                  messageStr: `Existing changes:
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum consequat ex a varius. Fusce varius ac nisl.
Your edited text: 
Vivamus ante ligula, tempor vel suscipit nec, elementum vel lectus. Nulla porttitor `
                },
                8: { 
                  color: 'danger',
                  onRenderItem,
                  messageStr: `Existing changes:
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum consequat ex a varius. Fusce varius ac nisl.
Your edited text: 
Vivamus ante ligula, tempor vel suscipit nec, elementum vel lectus. Nulla porttitor `
                },
                10: { 
                  color: 'primary',
                  onRenderItem,
                  messageStr: `Existing changes:
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum consequat ex a varius. Fusce varius ac nisl.
Your edited text: 
Vivamus ante ligula, tempor vel suscipit nec, elementum vel lectus. Nulla porttitor `
                },
              } 
          },
          2: { 
              v: {
                1: { 
                  color: 'danger',
                  onRenderItem,
                  messageStr: `Existing changes:
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elementum consequat ex a varius. Fusce varius ac nisl.
Your edited text: 
Vivamus ante ligula, tempor vel suscipit nec, elementum vel lectus. Nulla porttitor `
                },
              } 
          },
        },
      },
    },
  }

  const previewProps = {
    usfmText,
    renderFlags,
    bcvFilter,
    extInfo,
    htmlRender: false,
    verbose: true,
  }
  
  return (
      <div key="1">
        <BookPreview {...previewProps} />
      </div>
  );
};  

<div>
  <Component key="1" />
</div>

```
