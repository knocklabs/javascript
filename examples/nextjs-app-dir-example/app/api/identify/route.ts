import { faker } from "@faker-js/faker";
import Knock from "@knocklabs/node";
import { signUserToken } from "@knocklabs/node/lib/tokenSigner";
import { v4 as uuidv4 } from "uuid";

const knockClient = new Knock({
  apiKey: process.env.KNOCK_SECRET_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_KNOCK_HOST,
});

export const POST = async (request) => {
  const { id } = await request.json();
  const userId = id || uuidv4();

  try {
    const knockUser = await knockClient.users.update(userId, {
      // Create a user for the demo, we'll only set the name if we don't have a user yet
      name: id ? undefined : faker.person.fullName(),
    });

    let userToken = undefined;

    if (process.env.KNOCK_SIGNING_KEY) {
      userToken = await signUserToken(userId, {
        expiresInSeconds: process.env.KNOCK_TOKEN_EXPIRES_IN_SECONDS
          ? Number(process.env.KNOCK_TOKEN_EXPIRES_IN_SECONDS)
          : 3600,
      });
    }

    return new Response(
      JSON.stringify({
        error: null,
        user: knockUser,
        userToken,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || (error as Error).toString(),
        user: null,
      }),
      {
        status: 500,
      },
    );
  }
};
