import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

import "./ErrorElement.css";

function ErrorElement() {
  const error = useRouteError();
  return (
    <main className="ErrorElement">
      <h1>{isRouteErrorResponse(error) ? error.status : "Error"}</h1>
      <p>
        {isRouteErrorResponse(error)
          ? error.statusText
          : error instanceof Error
          ? error.message
          : String(error)}
      </p>
      <Link to="/">Home</Link>
    </main>
  );
}

export default ErrorElement;
