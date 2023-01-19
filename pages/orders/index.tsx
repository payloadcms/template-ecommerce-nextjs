import React, { useEffect, useState } from 'react';
import { useAuth } from '../../providers/Auth';
import classes from './index.module.css';
import { Input } from '../../components/Input';
import { useRouter } from 'next/router';
import { Gutter } from '../../components/Gutter';
import { GetStaticProps } from 'next';
import { getApolloClient } from '../../graphql';
import { HEADER_QUERY } from '../../graphql/globals';
import { Button } from '../../components/Button';
import { Order } from '../../payload-types';

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
};

const Orders: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, setUser } = useAuth();

  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>();

  useEffect(() => {
    if (user) {
      // no need to add a 'where' query here, the access control is handled by the API
      const fetchOrders = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/orders`, {
          credentials: 'include',
        });

        if (response.ok) {
          const json = await response.json();
          setOrders(json.docs);
        }
      }
      fetchOrders();
    }
  }, [user])

  useEffect(() => {
    if (user === null) {
      router.push(`/login?unauthorized=account`);
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof router.query.success === 'string') {
      setSuccess(router.query.success);
    }
  }, [router]);

  return (
    <Gutter className={classes.orders}>
      <h1>Orders</h1>
      {error && <div className={classes.error}>{error}</div>}
      {success && <div className={classes.success}>{success}</div>}
      {!orders || orders.length === 0 && (
        <p>
          You have no orders.
        </p>
      )}
      {orders && orders.length > 0 && (
        <ul className={classes.ordersList}>
          {orders.map((order) => (
            <li
              key={order.id}
              className={classes.item}
            >
              {order.id}
            </li>
          ))}
        </ul>
      )}
      <Button
        href="/account"
        appearance="primary"
        label="Go to account"
      />
    </Gutter>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: HEADER_QUERY
  });

  return {
    props: {
      header: data?.Header || null,
      footer: data?.Footer || null,
    },
  };
}

export default Orders;