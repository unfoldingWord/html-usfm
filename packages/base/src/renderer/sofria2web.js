const defaultSettings = {
  showWordAtts: false,
  showTitles: true,
  showHeadings: true,
  showFootnotes: true,
  showXrefs: true,
  showChapterLabels: true,
  showVersesLabels: true,
  showCharacterMarkup: true,
  showParaStyles: true,
};

const sofria2WebActions = {
  startDocument: [
    {
      description: 'Set up',
      test: () => true,
      action: ({ config, workspace: ws, output }) => {
        const _bookId = config.bookId
        ws.settings = { ...defaultSettings, ...config };
        ws.webParas = [];
        ws.doVerify = config.doVerify;
        ws.filterBcv = config.filterBcv;
        ws.verifyBcv = config.verifyBcv;
        ws.extInfo = config.extInfo;
        ws.bookId = _bookId?.charAt(0).toUpperCase() + _bookId?.slice(1).toLowerCase()
        ws.chNum = 1
        ws.curBcvId = ''
        ws.suppressBcv = !!config.bcvFilter;
        output.sofria = {};
        output.sofria.sequence = {};
        ws.currentSequence = output.sofria.sequence;
        ws.paraContentStack = [];
        ws.footnoteNo = 1;
      },
    },
  ],
  startSequence: [
    {
      description: 'identity',
      test: () => true,
      action: ({ context, workspace: ws }) => {
        ws.currentSequence.type = context.sequences[0].type;
        ws.currentSequence.blocks = [];
      },
    },
  ],
  endSequence: [
    {
      description: 'identity',
      test: () => true,
      action: ({ workspace: ws }) => {
        if (ws.currentSequence.type === 'footnote') {
          ws.footnoteNo++;
        }
        ws.currentSequence = null;
      },
    },
  ],
  blockGraft: [
    {
      description: 'Process block grafts',
      test: () => true,
      action: (env) => {
        const currentBlock = env.context.sequences[0].block;
        if (
          currentBlock.subType !== 'remark' &&
          !(
            ['title', 'endTitle'].includes(currentBlock.subType) &&
            !env.workspace.settings.showTitles
          ) &&
          !(
            ['heading'].includes(currentBlock.subType) &&
            !env.workspace.settings.showHeadings
          ) &&
          !(
            ['introduction'].includes(currentBlock.subType) &&
            !env.workspace.settings.showIntroductions
          )
        ) {
          const graftRecord = {
            type: currentBlock.type,
          };
          if (currentBlock.sequence) {
            graftRecord.sequence = {};
            const cachedSequencePointer = env.workspace.currentSequence;
            env.workspace.currentSequence = graftRecord.sequence;
            const cachedParaContentStack = env.workspace.paraContentStack;
            env.context.renderer.renderSequence(env);
            env.workspace.paraContentStack = cachedParaContentStack;
            env.workspace.currentSequence = cachedSequencePointer;
          }
          env.workspace.currentSequence.blocks.push(graftRecord);
        }
      },
    },
  ],
  inlineGraft: [
    {
      description: 'identity',
      test: ({ context, workspace: ws }) =>
        context.sequences[0].element.subType !== 'note_caller' &&
        !(
          ['footnote'].includes(context.sequences[0].element.subType) &&
          !ws.settings.showFootnotes
        ) &&
        !(
          ['xref'].includes(context.sequences[0].element.subType) &&
          !ws.settings.showXrefs
        ),
      action: (env) => {
        const element = env.context.sequences[0].element;
        const graftRecord = {
          type: element.type,
        };
        if (element.sequence) {
          graftRecord.sequence = {};
          const cachedSequencePointer = env.workspace.currentSequence;
          const cachedParaContentStack = [
            ...env.workspace.paraContentStack,
          ];
          const cachedWebParas = env.workspace.webParas;
          env.workspace.webParas = [];
          env.workspace.currentSequence = graftRecord.sequence;
          if (!env.workspace.suppressBcv) env.context.renderer.renderSequence(env);
          const sequencePseudoParas = env.workspace.webParas;
          env.workspace.webParas = cachedWebParas;
          env.workspace.paraContentStack = cachedParaContentStack;
          if (!env.workspace.suppressBcv) env.workspace.paraContentStack[0].content.push(
              sequencePseudoParas
          );
          env.workspace.currentSequence = cachedSequencePointer;
        }
      },
    },
  ],
  startParagraph: [
    {
      description: 'Initialise content stack',
      test: () => true,
      action: ({ context, workspace: ws }) => {
        const block = context.sequences[0].block;
        ws.paraContentStack = [
          {
            subType: block.subType,
            content: [],
          },
        ];
      },
    },
  ],
  endParagraph: [
    {
      description: 'Add completed para to webParas',
      test: () => true,
      action: ({ config, context, workspace: ws }) => {
        if ((!ws.suppressBcv) || (ws?.paraContentStack[0]?.content.length>0)) {
          ws.webParas.push(
            config.renderers.paragraph(
              ws.settings.showParaStyles ||
                ['footnote', 'xref'].includes(context.sequences[0].type)
                ? ws.paraContentStack[0].subType
                : 'usfm:m',
              ws?.paraContentStack[0]?.content,
              ws.footnoteNo
            )
          );
        }
      }
    }
  ],
  startWrapper: [
    {
      description: 'Skip usfm:w outside main sequence',
      test: ({ context }) =>
        context.sequences[0].element.subType === 'usfm:w' &&
        context.sequences[0].type !== 'main',
      action: () => {},
    },
    {
      description: 'Handle standard w attributes',
      test: ({ context }) => context.sequences[0].element.subType === 'usfm:w',
      action: ({ context, workspace: ws }) => {
        const atts = context.sequences[0].element.atts;
        const standardAtts = {};
        for (const [key, value] of Object.entries(atts)) {
          if (['strong', 'lemma', 'gloss'].includes(key)) {
            standardAtts[key] = value;
          }
        }
        ws.paraContentStack.unshift({
          atts: standardAtts,
          content: [],
        });
        return false;
      },
    },
    {
      description: 'Push to paraContent Stack',
      test: ({ context, workspace: ws }) =>
        !['chapter', 'verses'].includes(context.sequences[0].element.subType) &&
        ws.settings.showCharacterMarkup,
      action: ({ context, workspace: ws }) => {
        const pushed = {
          subType: context.sequences[0].element.subType,
          content: [],
        };
        ws.paraContentStack.unshift(pushed);
      },
    },
  ],
  endWrapper: [
    {
      description: 'Skip usfm:w outside main sequence',
      test: ({ context }) =>
        context.sequences[0].element.subType === 'usfm:w' &&
        context.sequences[0].type !== 'main',
      action: () => {},
    },
    {
      description: 'Handle standard w attributes',
      test: ({ context }) => context.sequences[0].element.subType === 'usfm:w',
      action: ({ config, workspace: ws }) => {
        const popped = ws.paraContentStack.shift();
        if (!ws.suppressBcv) ws.paraContentStack[0].content.push(
            config.renderers.wWrapper(
            ws.settings.showWordAtts ? popped.atts : {},
            popped.content
          )
        );
        return false;
      },
    },
    {
      description: 'Collapse one level of paraContent Stack',
      test: ({ context, workspace: ws }) =>
        !['chapter', 'verses'].includes(context.sequences[0].element.subType) &&
        ws.settings.showCharacterMarkup,
      action: ({ config, workspace: ws }) => {
        const popped = ws.paraContentStack.shift();
        if (!ws.suppressBcv) ws.paraContentStack[0].content.push(
          config.renderers.wrapper(popped.subType, popped.content)
        );
      },
    },
  ],
  startMilestone: [
    {
      description: 'Handle zaln word-like atts',
      test: ({ context }) =>
        context.sequences[0].element.subType === 'usfm:zaln',
      action: ({ context, workspace: ws }) => {
        const atts = context.sequences[0].element.atts;
        const standardAtts = {};
        for (const [key, value] of Object.entries(atts)) {
          if (['x-strong', 'x-lemma', 'x-morph', 'x-content'].includes(key)) {
            standardAtts[key.split('-')[1]] = value;
          }
        }
        ws.paraContentStack.unshift({
          atts: standardAtts,
          content: [],
        });
        return false;
      },
    },
  ],
  endMilestone: [
    {
      description: 'Handle zaln word-like atts',
      test: ({ context }) =>
        context.sequences[0].element.subType === 'usfm:zaln',
      action: ({ config, workspace: ws }) => {
        const popped = ws.paraContentStack.shift();
        if (!ws.suppressBcv) ws.paraContentStack[0].content.push(
          config.renderers.wWrapper(
            ws.settings.showWordAtts ? popped.atts : {},
            popped.content
          )
        );
        return false;
      },
    },
  ],
  text: [
    {
      description: 'Push text to para',
      test: () => true,
      action: ({ config, context, workspace: ws }) => {
        const element = context.sequences[0].element;
        const renderedText = config.renderers.text(element.text);
        if (!ws.suppressBcv) ws.paraContentStack[0].content.push(renderedText); // suppress filtered BCV
      },
    },
  ],
  mark: [
    {
      description: 'Show chapter/verse markers',
      test: () => true,
      action: ({ config, context, workspace: ws }) => {
        const element = context.sequences[0].element;
        if (element.subType === 'chapter_label') {
          ws.chNum = element.atts.number
          ws.curBcvId = `${ws.bookId}.${ws.chNum}.1`
          // Do a limited check at chapter level = 2
          const filteredOkChapterLabel = ((!config.bcvFilter) || ((ws?.doVerify) && ws.doVerify(ws?.curBcvId,ws.filterBcv,2)))
          if ((ws.settings.showChapterLabels) && (filteredOkChapterLabel)) {
            ws.paraContentStack[0].content.push(
              config.renderers.chapter_label(element.atts.number)
            );
          }
          if (!filteredOkChapterLabel) {
            ws.suppressBcv = true
          }
        } else if (element.subType === 'verses_label') {
          ws.curBcvId = `${ws.bookId}.${ws.chNum}.${element.atts.number}`
          // Do a check at verse level = 3
          const suppressVerse = ((config.bcvFilter) && !ws.doVerify(ws?.curBcvId,ws.filterBcv,3))
          const filteredOkVerseLabel = ((!config.bcvFilter) || !suppressVerse)
          if ((ws.settings.showVersesLabels) && (filteredOkVerseLabel)) {
            ws.paraContentStack[0].content.push(
              config.renderers.verses_label(element.atts.number)
            );
          }
          if (config.bcvFilter) {
            ws.suppressBcv = suppressVerse
          }
          if (!ws.suppressBcv && ws?.doVerify 
            && ws.doVerify(ws?.curBcvId,ws.verifyBcv)
            && config.renderers.extended_bcv_info
          ) {
            const bId = ws.bookId.toLowerCase()
            const vNum = element.atts.number
            ws.paraContentStack[0].content.push(
              config.renderers.extended_bcv_info(
                ws.curBcvId,
                ws?.extInfo?.book[bId]?.ch[ws.chNum]?.v[vNum]
              )
            );
          }
        }
      },
    },
  ],
  endDocument: [
    {
      description: 'Build JSX',
      test: () => true,
      action: ({ config, workspace: ws, output }) => {
        output.paras = config.renderers.mergeParas(ws.webParas);
      },
    },
  ],
};

export default sofria2WebActions;
