import { Link } from 'wouter';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mesh-bg flex min-h-[100dvh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><SearchX size={25}/></span>
        <p className="mt-6 font-mono text-xs uppercase tracking-[.2em] text-accent">404 / out of range</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">That tool is not on the shelf.</h1>
        <p className="mt-4 text-muted-foreground">The address may have moved, or the job you are looking for has not been added yet.</p>
        <Link href="/tools" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" data-testid="link-404-tools"><ArrowLeft size={16}/> Browse all tools</Link>
      </div>
    </div>
  );
}
