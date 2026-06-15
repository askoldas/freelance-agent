import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: Promise<{
    secret?: string;
  }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const secret = params?.secret ? `?secret=${encodeURIComponent(params.secret)}` : "";

  redirect(`/freelance${secret}`);
}
