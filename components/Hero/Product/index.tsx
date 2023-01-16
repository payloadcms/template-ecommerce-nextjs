import React, { Fragment } from 'react';
import { Cell, Grid } from '@faceless-ui/css-grid';
import { Gutter } from '../../Gutter';
import { VerticalPadding } from '../../VerticalPadding';
import { AddToCartButton } from '../../AddToCartButton';
import { Product } from '../../../payload-types';

import classes from './index.module.scss'
import { Media } from '../../Media';

export const ProductHero: React.FC<{
  product: Product
}> = ({ product }) => {
  const {
    title,
    categories,
    meta: {
      image: metaImage,
      description
    }
  } = product;

  return (
    <Gutter className={classes.productHero}>
      <Grid>
        <Cell cols={6} colsM={8}>
          <div className={classes.content}>
            <div className={classes.categories}>
              {categories?.map((category, index) => {
                const {
                  title: categoryTitle,
                } = category;

                const titleToUse = categoryTitle || 'Untitled category';

                const isLast = index === categories.length - 1;

                return (
                  <Fragment key={index}>
                    {titleToUse}
                    {!isLast && (
                      <Fragment>
                        ,
                        &nbsp;
                      </Fragment>
                    )}
                  </Fragment>
                )
              })}
            </div>
            <h1 className={classes.title}>
              {title}
            </h1>
            {description && (
              <p className={classes.description}>
                {description}
              </p>
            )}
            <AddToCartButton product={product} />
          </div>
        </Cell>
        <Cell cols={6} colsM={8}>
          <div className={classes.mediaWrapper}>
            {!metaImage && (
              <div className={classes.placeholder}>
                No image
              </div>
            )}
            {metaImage && typeof metaImage !== 'string' && (
              <Media
                imgClassName={classes.image}
                resource={metaImage}
                fill
              />
            )}
          </div>
        </Cell>
      </Grid>
    </Gutter>
  )
}
