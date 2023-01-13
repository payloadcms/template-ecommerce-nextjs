import { Cell, Grid } from '@faceless-ui/css-grid';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import classes from './index.module.scss'
import qs from 'qs';
import { useRouter } from 'next/router';
import { Product } from '../../payload-types';
import { Gutter } from '../Gutter';
import { PageRange } from '../PageRange';
import { Card } from '../Card';
import { ArchiveBlockProps } from '../../blocks/ArchiveBlock';

const minLoadingTime = 1000; // require at least 1 second to load to give time for the scroll to finish

type Result = {
  totalDocs: number
  docs: (Product)[]
  page: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
  nextPage: number
  prevPage: number
}

export type Props = {
  className?: string
  relationTo?: 'products'
  populateBy?: 'collection' | 'selection'
  showPageRange?: boolean
  onResultChange?: (result: Result) => void // eslint-disable-line no-unused-vars
  sort?: string
  limit?: number
  populatedDocs?: ArchiveBlockProps['populatedDocs']
  populatedDocsTotal?: ArchiveBlockProps['populatedDocsTotal']
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const {
    className,
    relationTo,
    showPageRange,
    onResultChange,
    sort = '-createdAt',
    limit = 10,
    populatedDocs,
    populatedDocsTotal
  } = props;

  const [results, setResults] = useState<Result>({
    totalDocs: typeof populatedDocsTotal === 'number' ? populatedDocsTotal : 0,
    docs: populatedDocs?.map((doc) => doc.value) || [],
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: 1,
    nextPage: 1
  });

  const {
    // `query` contains both router AND search params
    query: {
      categories,
      city,
      page
    } = {},
  } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToRef = useCallback(() => {
    const { current } = scrollRef;
    if (current) {
      current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (typeof page !== 'undefined') {
      scrollToRef();
    }
  }, [
    isLoading,
    scrollToRef,
    page
  ])

  useEffect(() => {
    // hydrate the block with fresh content after first render
    // don't show loader unless the request takes longer than x ms
    let timer: NodeJS.Timeout = setTimeout(() => {
      setIsLoading(true)
    }, 500)

    const searchParams = qs.stringify({
      sort,
      where: {
        ...categories ? {
          categories: {
            in: typeof categories === 'string' ? [categories] : categories
          },
        } : {},
      },
      limit,
      page,
      depth: 1
    }, { encode: false })

    const makeRequest = async () => {
      try {
        const req = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/${relationTo}?${searchParams}`);
        const json = await req.json();
        clearTimeout(timer);

        const { docs } = json as { docs: Product[] };

        if (docs && Array.isArray(docs)) {
          setResults(json)
          setIsLoading(false);
          if (typeof onResultChange === 'function') {
            onResultChange(json);
          }
        }
      } catch (err) {
        console.warn(err);
        setIsLoading(false);
        setError(`Unable to load "${relationTo} archive" data at this time.`);
      }
    }

    makeRequest();

    return () => {
      if (timer) clearTimeout(timer);
    }
  }, [
    page,
    city,
    categories,
    relationTo,
    onResultChange,
    sort,
    limit
  ]);

  return (
    <div
      className={[
        classes.collectionArchive,
        className
      ].filter(Boolean).join(' ')}
    >
      <div
        ref={scrollRef}
        className={classes.scrollRef}
      />
      {isLoading && (
        <Gutter>
          Loading, please wait...
        </Gutter>
      )}
      {!isLoading && error && (
        <Gutter>
          {error}
        </Gutter>
      )}
      {!isLoading && (
        <Fragment>
          {showPageRange !== false && (
            <Gutter>
              <Grid>
                <Cell
                  cols={6}
                  colsM={4}
                >
                  <div className={classes.pageRange}>
                    <PageRange
                      totalDocs={results.totalDocs}
                      currentPage={results.page}
                      collection={relationTo}
                      limit={limit}
                    />
                  </div>
                </Cell>
              </Grid>
            </Gutter>
          )}
          <Gutter>
            <Grid className={classes.grid}>
              {results.docs?.map((result, index) => {
                return (
                  <Cell
                    key={index}
                    className={classes.row}
                    cols={4}
                    colsM={8}
                  >
                    <Card
                      relationTo='products'
                      doc={result}
                      showCategories
                    />
                  </Cell>
                )
              })}
            </Grid>
          </Gutter>
        </Fragment>
      )}
    </div>
  )
}
