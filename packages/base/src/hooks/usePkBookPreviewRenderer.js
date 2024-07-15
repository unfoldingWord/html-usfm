// eslint-disable-next-line no-unused-vars
import React,
{ useState, useEffect, useCallback }
from 'react'
import PropTypes from 'prop-types'
import { Proskomma } from 'proskomma-core'
import { SofriaRenderFromProskomma } from 'proskomma-json-tools'
import sofria2WebActions from '../renderer/sofria2web'
import { Render2React } from '../renderer/render2react'
import { Render2Html } from '../renderer/render2html'
import { getBcvVerifyStruct, isVerifiedWithBcvStruct } from '../helpers/bcvVerify'

const defaultFlags = {
  showWordAtts: false,
  showTitles: true,
  showHeadings: true,
  showIntroductions: true,
  showFootnotes: true,
  showXrefs: true,
  showParaStyles: true,
  showCharacterMarkup: true,
  showChapterLabels: true,
  showVersesLabels: true,
}

export default function usePkBookPreviewRenderer(props) {
  const {
    pk, 
    docId, 
    bookId,
    renderStyles = null,
  } = props

  const [ready,setReady] = useState(false)

  useEffect(() => {
    if ((docId != null) && (pk != null) && (bookId != null)) {
      setReady(true)
    }
  },[bookId, docId, pk])

  const doRender = useCallback(({
    renderFlags,
    htmlRender,
    verbose,
    bcvFilter,
    extInfo,
  }) => {
    const output = {}
    if ((docId != null) && (pk != null) && (bookId != null)) {
      const renderer = new SofriaRenderFromProskomma({
        proskomma: pk,
        actions: sofria2WebActions,
      })

      let renderers = null
      if (htmlRender) { // create a class instance of Render2Html and then get render functions bound to instance
        const newRenderer = new Render2Html(renderStyles)
        renderers = newRenderer.getRenderers()
      } else {
        const newRenderer = new Render2React(renderStyles)
        renderers = newRenderer.getRenderers()
      }

      const config = {
        ...defaultFlags,
        ...renderFlags,
        bookId,
        bcvFilter,
        extInfo,
        filterBcv: getBcvVerifyStruct(bcvFilter),
        verifyBcv: getBcvVerifyStruct(extInfo),
        doVerify: isVerifiedWithBcvStruct,
        renderers,
      }
      try {
        renderer.renderDocument({
          docId,
          config,
          output,
        })
      } catch (err) {
        if (verbose) console.log('Renderer', err)
        throw err
      }
    }
    return output.paras
  },[bookId, docId, pk, renderStyles])

  return {
    ready,
    doRender,
  }
}

 /** Rendering flags *
  renderFlags: PropTypes.objectOf(PropTypes.bool),
  /** Extended info - to be displayed for some verses *
  extInfo: PropTypes.any,
  /** Whether to show extra info in the js console *
  verbose: PropTypes.bool,
  /** Whether to render in html - default is to render React  *
  htmlRender: PropTypes.bool,
*/

usePkBookPreviewRenderer.propTypes = {
  /** Instance of Proskomma class */
  pk: PropTypes.instanceOf(Proskomma),
  /** docId - the id of this document - taken from Proskomma */
  docId: PropTypes.string, 
  /** bookId selector for what content to show in the preview */
  bookId: PropTypes.string,
  /** app preferred styles to use */
  renderStyles: PropTypes.object,
}

