import { useEffect, FC } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

interface Props {
  [key: string]: any;
}

const withAuth = (Component: FC<Props>) => {
  const AuthComponent: FC<Props> = (props: Props) => {
    const { data: session, status } = useSession();
    const isUserLoggedIn = status === 'authenticated';
    const isPageLoading = status === 'loading';
    const router = useRouter();

    useEffect(() => {
      if (!isUserLoggedIn && !isPageLoading) {
        setTimeout(() => router.push('/auth'), 100)
      } else if (isUserLoggedIn && router.pathname === '/auth') {
        signOut();
      }
    }, [isUserLoggedIn, isPageLoading, router]);

    if (isPageLoading) {
      return <div>Loading...</div>; // Replace with your preferred loading UI
    }

    return <Component {...props} />;
  };

  return AuthComponent;
}

export default withAuth;
