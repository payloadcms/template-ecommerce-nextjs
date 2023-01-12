import { Cell, Grid } from '@faceless-ui/css-grid';
import React from 'react';
import { Page } from '../../../payload-types';
import { CollectionArchive } from '../../CollectionArchive';
import { Gutter } from '../../Gutter';
import RichText from '../../RichText';
import classes from './index.module.scss'

type Props = Extract<Page['layout'][0], { blockType: 'archive' }>

export const ArchiveBlock: React.FC<Props & {
  id?: string
}> = (props) => {

  const {
    introContent,
    id,
    relationTo,
    populateBy,
  } = props;

  return (
    <div
      id={`block-${id}`}
      className={classes.archiveBlock}
    >
      {introContent && (
        <Gutter className={classes.introContent}>
          <Grid>
            <Cell
              cols={12}
              colsM={8}
            >
              <RichText content={introContent} />
            </Cell>
          </Grid>
        </Gutter>
      )}
      <CollectionArchive
        populateBy={populateBy}
        relationTo={relationTo}
        sort="-publishedDate"
      />
    </div>
  )
}
