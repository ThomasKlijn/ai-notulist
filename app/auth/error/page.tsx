export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authenticatie Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Er is een probleem opgetreden tijdens het inloggen. 
            Probeer het opnieuw.
          </p>
          <div className="mt-4">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Opnieuw inloggen
            </a>
          </div>
          <div className="mt-2">
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Terug naar home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}