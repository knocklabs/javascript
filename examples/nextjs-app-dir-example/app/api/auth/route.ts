import { signUserToken } from "@knocklabs/node/lib/tokenSigner";
import { v4 as uuidv4 } from "uuid";

export const GET = async (request) => {
  const { id } = request.query;
  const userId = (id as string) || uuidv4();

  try {
    const userToken = await signUserToken(userId, {
      expiresInSeconds: process.env.KNOCK_TOKEN_EXPIRES_IN_SECONDS
        ? Number(process.env.KNOCK_TOKEN_EXPIRES_IN_SECONDS)
        : 3600,
    });

    return new Response(JSON.stringify({ error: null, userToken }), {
      status: 200,
    });
  } catch (error) {
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
