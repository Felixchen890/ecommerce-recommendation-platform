import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const PRODUCTS_QUERY = gql`
  query {
    products {
      id
      name
      category
      brand
      price
      imageUrl
      popularityScore
      tags
    }
  }
`;

const RECOMMENDATIONS_QUERY = gql`
  query Recommendations($userId: String!) {
    recommendations(userId: $userId) {
      id
      name
      category
      brand
      price
      imageUrl
      popularityScore
      tags
    }
  }
`;

const TRACK_EVENT_MUTATION = gql`
  mutation TrackEvent($input: TrackEventInput!) {
    trackEvent(input: $input) {
      id
      userId
      productId
      eventType
      sessionId
      experimentGroup
    }
  }
`;

const DEMO_USER_ID = "demo-user-1";

function getSessionId() {
  let sessionId = localStorage.getItem("sessionId");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
  }

  return sessionId;
}

function getExperimentGroup() {
  let group = localStorage.getItem("experimentGroup");

  if (!group) {
    group = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem("experimentGroup", group);
  }

  return group;
}

function App() {
  const { loading, error, data } = useQuery(PRODUCTS_QUERY);

  const {
    loading: recommendationsLoading,
    error: recommendationsError,
    data: recommendationsData,
    refetch: refetchRecommendations,
  } = useQuery(RECOMMENDATIONS_QUERY, {
    variables: { userId: DEMO_USER_ID },
  });

  const [trackEvent] = useMutation(TRACK_EVENT_MUTATION);

  const handleProductClick = async (productId) => {
    try {
      await trackEvent({
        variables: {
          input: {
            userId: DEMO_USER_ID,
            productId,
            eventType: "view_product",
            sessionId: getSessionId(),
            experimentGroup: getExperimentGroup(),
          },
        },
      });

      console.log("view_product event tracked:", productId);
      refetchRecommendations();
    } catch (err) {
      console.error("Failed to track event:", err);
    }
  };

  if (loading) return <p style={{ padding: "40px" }}>Loading products...</p>;

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
      <p>Product list loaded from MongoDB via GraphQL.</p>
      <p>
        Demo User: <strong>{DEMO_USER_ID}</strong> · Experiment Group:{" "}
        <strong>{getExperimentGroup()}</strong>
      </p>




      <section style={{ marginTop: "30px" }}>
        <h2>Recommended For You</h2>

        {recommendationsLoading && <p>Loading recommendations...</p>}

        {recommendationsError && (
          <pre style={{ color: "red" }}>{recommendationsError.message}</pre>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "16px",
          }}
        >
          {recommendationsData?.recommendations?.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              style={{
                border: "2px solid #222",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                cursor: "pointer",
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                }}
              />

              <h3 style={{ fontSize: "18px", marginTop: "12px" }}>
                {product.name}
              </h3>

              <p style={{ margin: "4px 0", color: "#555" }}>
                {product.brand} · {product.category}
              </p>

              <p style={{ fontWeight: "bold" }}>${product.price}</p>

              <p style={{ fontSize: "13px", color: "#777" }}>
                Popularity: {product.popularityScore}
              </p>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ margin: "40px 0" }} />

      <h2>All Products</h2>








      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {data.products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "8px",
                background: "#f5f5f5",
              }}
            />

            <h2 style={{ fontSize: "18px", marginTop: "12px" }}>
              {product.name}
            </h2>

            <p style={{ margin: "4px 0", color: "#555" }}>
              {product.brand} · {product.category}
            </p>

            <p style={{ fontWeight: "bold" }}>${product.price}</p>

            <p style={{ fontSize: "13px", color: "#777" }}>
              Popularity: {product.popularityScore}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background: "#f0f0f0",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default App;