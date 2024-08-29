
import React from 'react'
import PropTypes from 'prop-types'
import useUsfmPreviewRenderer from "../hooks/useUsfmPreviewRenderer"
import DOMPurify from 'dompurify'

export default function BookPreview(props) {
  const {
    usfmText,
    verbose = false,
    htmlRender = true, 
    extInfo, 
    bcvFilter,
    renderFlags,
    ...extraProps
  } = props

  const { renderedData, ready } = useUsfmPreviewRenderer({
    usfmText,
    verbose, 
    extInfo,
    htmlRender, 
    bcvFilter,
    renderFlags,
    ...extraProps
  })

  return (
    <div>
      { (!ready || !renderedData) && 'Loading...'}
      { (htmlRender && ready && renderedData) && <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(renderedData)}}/>}
      { (!htmlRender && ready && renderedData) && <>{renderedData}</>}
    </div>
  )
}

BookPreview.propTypes = {
  /** The text in usfm format to load in the editor */
  usfmText: PropTypes.string,
  /** Rendering flags */
  renderFlags: PropTypes.objectOf(PropTypes.bool),
  /** BCV Filter - limit which verses to display */
  bcvFilter: PropTypes.any,
  /** Extended info - to be displayed for some verses */
  extInfo: PropTypes.any,
  /** Whether to show extra info in the js console */
  verbose: PropTypes.bool,
  /** Whether to render to html or React components */
  htmlRender: PropTypes.bool,
}

