import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { useAuth } from '../../providers/Auth';
import classes from './index.module.css';
import { Input } from '../../components/Input';
import { Gutter } from '../../components/Gutter';
import { GetStaticProps } from 'next';
import { getApolloClient } from '../../graphql';
import { HEADER_QUERY } from '../../graphql/globals';

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
    <Gutter>
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
            <button type="submit">
              Create account
            </button>
          </form>
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
    query: HEADER_QUERY
  });

  return {
    props: {
      header: data?.Header || null,
      footer: data?.Footer || null,
    },
  };
}

export default CreateAccount;
