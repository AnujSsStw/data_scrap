import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jwt } = req.body;
  res.setHeader("Set-Cookie", `jwt=${jwt}; Path=/; HttpOnly`);
  res.status(200);
}
