import Link from 'next/link';
import { useForm } from 'react-hook-form';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../providers/Auth';
import { Input } from '../../components/Input';
import classes from './index.module.css';
import { useRouter } from 'next/router';
import { Gutter } from '../../components/Gutter';
import { GetStaticProps } from 'next';
import { getApolloClient } from '../../graphql';
import { QUERY_HEADER } from '../../graphql/header';

type FormData = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data);
        router.push('/account');
      } catch (_) {
        setError('There was an error with the credentials provided. Please try again.');
      }
    },
    [login, router],
  );

  useEffect(() => {
    if (router.query.unauthorized) {
      setError(`To visit the ${router.query.unauthorized} page, you need to be logged in.`);
    }
  }, [router]);

  return (
    <Gutter>
      <h1>Log in</h1>
      {error && <div className={classes.error}>{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        <Input name="email" label="Email Address" required register={register} error={errors.email} />
        <Input name="password" type="password" label="Password" required register={register} error={errors.password} />
        <input type="submit" />
      </form>
      <Link href="/create-account">
        <a>Create an account</a>
      </Link>
      <br />
      <Link href="/recover-password">
        <a>Recover your password</a>
      </Link>
    </Gutter>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: QUERY_HEADER
  });

  return {
    props: {
      header: data?.Header || null,
      footer: data?.Footer || null,
    },
  };
}

export default Login;
