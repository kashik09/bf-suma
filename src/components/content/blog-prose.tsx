import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface BlogProseProps {
  content: string;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h2 className="mb-3 mt-8 text-2xl font-bold tracking-tight text-slate-900 first:mt-0 sm:text-3xl">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight text-slate-900 first:mt-0 sm:text-2xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-lg font-semibold text-slate-900 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1 mt-4 text-base font-semibold text-slate-800 first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-base leading-7 text-slate-700">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 space-y-2 pl-0 text-slate-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5 text-slate-700 marker:font-semibold marker:text-brand-600">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="relative pl-5 text-base leading-7 before:absolute before:left-0 before:top-[11px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-500 [ol_&]:pl-0 [ol_&]:before:hidden">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-brand-400 bg-brand-50/50 py-3 pl-4 pr-3 italic text-slate-700">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-800">{children}</em>
  ),
  a: ({ href, children }) => (
    <a
      className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 transition hover:text-brand-800 hover:decoration-brand-500"
      href={href}
      rel="noopener noreferrer"
      target={href?.startsWith("http") ? "_blank" : undefined}
    >
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800">
          {children}
        </code>
      );
    }
    return (
      <code className="block overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-4 overflow-hidden rounded-lg">{children}</pre>
  ),
  hr: () => (
    <hr className="my-8 border-t border-slate-200" />
  ),
  img: ({ src, alt }) => (
    <figure className="my-6">
      {typeof src === "string" ? (
        <Image
          alt={alt || "BF Suma blog article image"}
          sizes="(max-width: 768px) 100vw, 760px"
          className="h-auto w-full rounded-xl shadow-soft"
          src={src}
          unoptimized
          width={1200}
          height={720}
        />
      ) : null}
      {alt ? (
        <figcaption className="mt-2 text-center text-sm text-slate-500">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  )
};

export function BlogProse({ content }: BlogProseProps) {
  return (
    <div className="blog-prose">
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
