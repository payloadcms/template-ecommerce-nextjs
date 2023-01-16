import React, { Fragment } from 'react';
import { CartPage, Page } from '../../payload-types';
import { toKebabCase } from '../../utilities/toKebabCase';
import { BackgroundColor } from '../BackgroundColor';
import { VerticalPaddingOptions } from '../VerticalPadding';
import { ArchiveBlock } from '../../blocks/ArchiveBlock';
import { CallToActionBlock } from '../../blocks/CallToAction';
import { ContentBlock } from '../../blocks/Content';
import { MediaBlock } from '../../blocks/MediaBlock';

const blockComponents = {
  cta: CallToActionBlock,
  content: ContentBlock,
  mediaBlock: MediaBlock,
  archive: ArchiveBlock
}

const Blocks: React.FC<{
  blocks: Page['layout'] | CartPage['layout']
  disableTopPadding?: boolean
}> = (props) => {
  const {
    disableTopPadding,
    blocks,
  } = props;

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0;

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const {
            blockName,
            blockType,
          } = block;

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType];
            const backgroundColor = block[`${blockType}BackgroundColor`];
            const prevBlock = blocks[index - 1];
            const nextBlock = blocks[index + 1];

            const prevBlockBackground = prevBlock?.[`${prevBlock.blockType}BackgroundColor`];
            const nextBlockBackground = nextBlock?.[`${nextBlock.blockType}BackgroundColor`];

            let paddingTop: VerticalPaddingOptions = 'large';
            let paddingBottom: VerticalPaddingOptions = 'large';

            if (backgroundColor && backgroundColor === prevBlockBackground) {
              paddingTop = 'medium';
            }

            if (backgroundColor && backgroundColor === nextBlockBackground) {
              paddingBottom = 'medium';
            }

            if (disableTopPadding && index === 0) {
              paddingTop = 'none';
            }

            if (Block) {
              return (
                <BackgroundColor
                  key={index}
                  paddingTop={paddingTop}
                  paddingBottom={paddingBottom}
                  color={backgroundColor}
                >
                  {/* @ts-ignore */}
                  <Block
                    // @ts-ignore
                    id={toKebabCase(blockName)}
                    {...block}
                  />
                </BackgroundColor>
              );
            }
          }
          return null;
        })}
      </Fragment>
    );
  }

  return null;
};

export default Blocks;
