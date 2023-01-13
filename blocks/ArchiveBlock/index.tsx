import { Cell, Grid } from '@faceless-ui/css-grid';
import React from 'react';
import { Page } from '../../payload-types';
import { CollectionArchive } from '../../components/CollectionArchive';
import { Gutter } from '../../components/Gutter';
import RichText from '../../components/RichText';
import classes from './index.module.scss'

export type ArchiveBlockProps = Extract<Page['layout'][0], { blockType: 'archive' }>

export const ArchiveBlock: React.FC<ArchiveBlockProps & {
  id?: string
}> = (props) => {

  const {
    introContent,
    id,
    relationTo,
    populateBy,
    limit,
    populatedDocs,
    populatedDocsTotal
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
        populatedDocs={populatedDocs}
        populatedDocsTotal={populatedDocsTotal}
        limit={limit}
        sort="-publishedDate"
      />
    </div>
  )
}
