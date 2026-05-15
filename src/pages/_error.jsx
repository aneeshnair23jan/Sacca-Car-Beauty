import Link from 'next/link';

export default function ErrorPage({ statusCode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="text-8xl font-extrabold text-primary-600 mb-4">{statusCode || 'Error'}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {statusCode === 404 ? 'Page not found' : 'Something went wrong'}
        </h1>
        <p className="text-gray-500 mb-8">
          {statusCode === 404
            ? "The page you're looking for doesn't exist."
            : 'An unexpected error occurred. Please try again.'}
        </p>
        <Link href="/" className="btn-primary py-3 px-8">
          Go back home
        </Link>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
