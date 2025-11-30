export default async function Page() {
  const data = await fetch("https://api.vercel.app/blog");
  const posts = await data.json();

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-blue-500">
            Resume Constructor
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            Latest updates & tutorials
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Curated articles that help you craft better resumes and stay
            up-to-date with our product news.
          </p>
        </header>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <li
              key={post.id}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-blue-500">
                {post.author?.name ?? "Blog"}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-blue-600">
                {post.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600 text-ellipsis overflow-hidden">
                {post.body}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{post.date ?? "Updated recently"}</span>
                <span className="font-medium text-blue-600">Read more →</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
