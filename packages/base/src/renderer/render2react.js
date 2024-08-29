/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { renderStyles as styles_ } from './renderStyles';

function InlineElement(props) {
  const [display, setDisplay] = useState(false);
  const toggleDisplay = () => setDisplay(!display);
  if (display) {
    return (
      <div
        style={{
          ...props.style,
          ...props.displayStyle,
        }}
        onClick={toggleDisplay}
      >
        {props.children}
      </div>
    );
  } else {
    return (
      <span
        style={props.nonDisplayStyle}
        onClick={toggleDisplay}
      >
        {props.linkText}
      </span>
    );
  }
}

export class Render2React {
  /**
   * create an instance of class that uses style passed in.  If styles not defined then will use default settings
   * @param {object} styles - optional custom styles to use for render
   */
  constructor(styles) {
      this.styles = styles || styles_;
      this.chapter = "0";
  }

  getStyles = (type, subType) => {
    if (!this.styles[type]) {
      throw new Error(`Unknown style type '${type}'`);
    }
    if (!this.styles[type][subType]) {
      console.log(`No styles for ${type}/${subType}`);
      return this.styles[type].default;
    }
    return { ...this.styles[type].default, ...this.styles[type][subType] };
  };
    
  getRenderers() {
    const renderers = {
      text: (text) => text,
      chapter_label: (number) => {
        this.chapter = number
        return <span id={"chapter-"+number} key={"chapter-"+number} style={this.getStyles('marks', 'chapter_label')}>{number}</span>
      },
      verses_label: (number) => (
        <span id={"chapter-"+this.chapter+"-verse-"+number} key={"chapter-"+this.chapter+"-verse-"+number} style={this.getStyles('marks', 'verses_label')}>{number}</span>
      ),
      extended_bcv_info: (verseId,extInfo) => {
        if (extInfo?.onRenderItem) {
          return extInfo.onRenderItem({
            verseId,
            extInfo
          })
        } else {
          return <span style={this.getStyles('extendedBcvInfo')}>{JSON.stringify(extInfo)}</span>
        }  
      },
      paragraph: (subType, content, footnoteNo) =>
        ['usfm:f', 'usfm:x'].includes(subType) ? (
          <InlineElement
            style={this.getStyles('paras', subType)}
            displayStyle={this.getStyles('paras', 'displayInline')}
            nonDisplayStyle={this.getStyles('paras', 'nonDisplayInline')}
            linkText={subType === 'usfm:f' ? `${footnoteNo}` : '*'}
          >
            {content}
          </InlineElement>
        ) : (
          <p style={this.getStyles('paras', subType)}>{content}</p>
        ),
      wrapper: (subType, content) => (
        <span style={this.getStyles('wrappers', subType)}>{content}</span>
      ),
      wWrapper: (atts, content) =>
        Object.keys(atts).length === 0 ? (
          content
        ) : (
          <span
            style={{
              display: 'inline-block',
              verticalAlign: 'top',
              textAlign: 'center',
            }}
          >
            <div>{content}</div>
            {Object.entries(atts).map((a,inx) => (
              <div
                style={{
                  fontSize: 'xx-small',
                  fontWeight: 'bold',
                }}
                key={inx}
              >
                {`${a[0]} = ${a[1]}`}
              </div>
            ))}
          </span>
        ),
      mergeParas: (paras) => paras,
    };

    // bind all the renderer methods to this object instance
    const renderers_ = {}
    for (const [key, method] of Object.entries(renderers)) {
      const boundMethod = method.bind(this)
      renderers_[key] = boundMethod
    }
    return renderers_;
  }
}
