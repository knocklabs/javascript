import { KnockProvider } from "@knocklabs/react";

export default function Home() {
  const user = {
    id: "123",
    email: "",
    name: "",
    phone_number: "",
    avatar: "",
    updated_at: "",
    created_at: "",
  };

  return (
    <KnockProvider
      apiKey={process.env.NEXT_PUBLIC_KNOCK_CLIENT_ID!}
      userId={user.id}
      host={process.env.NEXT_PUBLIC_KNOCK_API_URL}
    >
      <div
        style={{
          marginBottom: "20px",
          fontFamily: "monospace",
          fontSize: "40px",
        }}
      >
        MS Teams connector examples
      </div>
    </KnockProvider>
  );
}
