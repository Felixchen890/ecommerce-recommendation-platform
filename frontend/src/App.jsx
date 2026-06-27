import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const HELLO_QUERY = gql`
  query {
    hello
  }
`;

function App() {
  const { loading, error, data } = useQuery(HELLO_QUERY);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial" }}>
        <h1>GraphQL Error</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>E-commerce Recommendation Platform</h1>
      <p>{data.hello}</p>
    </main>
  );
}

export default App;