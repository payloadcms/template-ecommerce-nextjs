import React, { Fragment, useCallback, useState } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { useAuth } from '../../providers/Auth';
import classes from './index.module.css';
import { Input } from '../../components/Input';
import { Gutter } from '../../components/Gutter';
import { GetStaticProps } from 'next';
import { getApolloClient } from '../../graphql';
import { FOOTER, HEADER, SETTINGS } from '../../graphql/globals';
import { gql } from '@apollo/client';
import { Button } from '../../components/Button';

type FormData = {
  email: string
  password: string
  firstName: string
  lastName: string
}

const CreateAccount: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = useCallback(async (data: FormData) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/users`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      // Automatically log the user in
      await login({ email: data.email, password: data.password });

      // Set success message for user
      setSuccess(true);

      // Clear any existing errors
      setError('')
    } else {
      setError('There was a problem creating your account. Please try again later.');
    }
  }, [login]);

  return (
    <Gutter className={classes.createAccount}>
      {!success && (
        <React.Fragment>
          <h1>Create Account</h1>
          {error && (
            <div className={classes.error}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
            <Input name="email" label="Email Address" required register={register} error={errors.email} />
            <Input name="password" type="password" label="Password" required register={register} error={errors.password} />
            <Input name="firstName" label="First Name" required register={register} error={errors.firstName} />
            <Input name="lastName" label="Last Name" required register={register} error={errors.lastName} />
            <Button
              type="submit"
              label="Create account"
              appearance="primary"
            />
          </form>
          <Fragment>
            {'Already have an account? '}
            <Link href="/login">
              Login
            </Link>
          </Fragment>
        </React.Fragment>
      )}
      {success && (
        <React.Fragment>
          <h1>Account created successfully</h1>
          <p>You are now logged in.</p>
          <Link href="/account">
            Go to your account
          </Link>
        </React.Fragment>
      )}
    </Gutter>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = getApolloClient();

  const { data } = await apolloClient.query({
    query: gql(`
      query {
        ${HEADER}
        ${FOOTER}
        ${SETTINGS}
      }
    `)
  });

  return {
    props: {
      header: data?.Header || null,
      footer: data?.Footer || null,
    },
  };
}

export default CreateAccount;
