import classes from './index.module.scss';
import { Fragment } from 'react';
import { Product } from '../../payload-types';
import Link from 'next/link';
import { Media } from '../Media';
import { AddToCartButton } from '../AddToCartButton';

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  showCategories?: boolean
  hideImagesOnMobile?: boolean
  title?: string
  relationTo?: 'products'
  doc?: Product
}> = (props) => {
  const {
    showCategories,
    title: titleFromProps,
    relationTo,
    doc,
    doc: {
      slug,
      title,
      categories,
      meta,
    } = {},
    className
  } = props;

  const {
    description,
    image: metaImage
  } = meta || {};

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0;
  const titleToUse = titleFromProps || title;
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/products/${slug}`;

  return (
    <div
      className={[
        classes.card,
        className
      ].filter(Boolean).join(' ')}
    >
      <Link
        href={href}
        className={classes.mediaWrapper}
      >
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
      </Link>
      {showCategories && hasCategories && (
        <div className={classes.leader}>
          {showCategories && hasCategories && (
            <div>
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
          )}
        </div>
      )}
      {titleToUse && (
        <h4 className={classes.title}>
          <Link href={href}>
            {titleToUse}
          </Link>
        </h4>
      )}
      {description && (
        <div className={classes.body}>
          {description && (
            <p className={classes.description}>
              {sanitizedDescription}
            </p>
          )}
        </div>
      )}
      <AddToCartButton product={doc} />
    </div>
  )
}
