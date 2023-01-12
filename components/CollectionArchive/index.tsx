import { Cell, Grid } from '@faceless-ui/css-grid';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import classes from './index.module.scss'
import qs from 'qs';
import { useRouter } from 'next/router';
import { Product } from '../../payload-types';
import { Gutter } from '../Gutter';
import { PageRange } from '../PageRange';
import { Card } from '../Card';

const perPage = 10;
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
  showControls?: boolean
  sort?: string
  showDates?: boolean
  showCategories?: boolean
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const {
    className,
    relationTo,
    showPageRange,
    onResultChange,
    sort = '-createdAt',
    showControls,
    showDates,
    showCategories,
  } = props;

  const [results, setResults] = useState<Result>({
    totalDocs: 0,
    docs: [],
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: 1,
    nextPage: 1
  });

  const {
    query: {  // contains both router AND search params
      category, // (router param)
      categories,
      city,
      page
    } = {},
  } = useRouter();

  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);

    // wait x ms before requesting new data, to give the illusion of load while the scrollTo finishes and to avoid loading flash when on fast networks
    let timer: NodeJS.Timeout;
    timer = setTimeout(() => {
      const searchParams = qs.stringify({
        sort,
        where: {
          ...(categories || category) ? {
            'categories.slug': {
              in: [
                categories,
                category
              ].filter(Boolean)
            },
          } : {},
        },
        limit: perPage,
        page,
        depth: 1
      }, { encode: false })

      const makeRequest = async () => {
        try {
          const req = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/${relationTo}?${searchParams}`);
          const json = await req.json();

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
    }, minLoadingTime);

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
    category
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
      {/* {shs */}
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
                      limit={perPage}
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
