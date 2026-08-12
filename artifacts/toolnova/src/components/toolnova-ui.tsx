import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Check, ChevronDown, ChevronUp, FileUp, Menu, Moon, Search, ShieldCheck, Sun, X } from 'lucide-react';
import { categories, type Tool } from '@/data/tools';
import { ads } from '@/config/ads';

export function AdSlot({ label = 'Reserved space' }: { label?: string }) {
  if (!ads.enabled) return <div className="my-8 flex min-h-12 items-center justify-center rounded-lg border border-dashed border-border/70 text-[10px] uppercase tracking-[.24em] text-muted-foreground/55" aria-label="Advertisement placeholder">{label}</div>;
  return <div className="my-8 min-h-24" aria-label="Advertisement" />;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [location, navigate] = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('toolnova-theme') === 'dark');
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); navigate('/tools'); } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [navigate]);
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle('dark', next); localStorage.setItem('toolnova-theme', next ? 'dark' : 'light'); };
  const links = [{ label:'Home', href:'/' }, { label:'All tools', href:'/tools' }, ...[...categories, 'Calculators'].map((c) => ({ label:c, href:`/tools?category=${c}` }))];
  return <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-5 px-4 sm:px-6">
      <Link href="/" className="group flex shrink-0 items-center gap-2" data-testid="link-logo">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6"><span className="font-mono text-sm font-bold">TN</span></span>
        <span className="text-lg font-bold tracking-tight">Tool<span className="text-accent">Nova</span></span>
      </Link>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">{links.map((link) => <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g,'-')}`} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location === link.href ? 'text-primary' : 'text-muted-foreground'}`}>{link.label}</Link>)}</nav>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => navigate('/tools')} aria-label="Search tools" data-testid="button-global-search" className="hidden size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted sm:grid"><Search size={18}/></button>
        <button onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} data-testid="button-theme-toggle" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
        <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open navigation" data-testid="button-mobile-menu" className="grid size-9 place-items-center rounded-lg hover:bg-muted lg:hidden">{open ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </div>
    {open && <nav className="border-t border-border bg-background px-4 py-3 lg:hidden" aria-label="Mobile navigation">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g,'-')}`} className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">{link.label}</Link>)}</nav>}
  </header>;
}

export function Footer() {
  return <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div><Link href="/" className="text-lg font-bold" data-testid="link-footer-logo">Tool<span className="text-accent">Nova</span></Link><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">A fast, private shelf of useful tools for the small jobs that still matter.</p><p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={14} className="text-primary"/> Browser-first. No account required.</p></div>
      <FooterGroup title="Tools" links={['/tools','/tools/image-compressor','/tools/pdf-merger','/tools/word-counter','/tools/json-formatter']} labels={['All tools','Image Compressor','PDF Merger','Word Counter','JSON Formatter']}/>
      <FooterGroup title="Categories" links={[...categories, 'Calculators'].map((c) => `/tools?category=${c}`)} labels={[...categories, 'Calculators']}/>
      <FooterGroup title="Company & legal" links={['/about','/contact','/privacy-policy','/terms','/cookie-policy']} labels={['About','Contact','Privacy policy','Terms of service','Cookie policy']}/>
    </div>
    <div className="border-t border-border/70 px-4 py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} ToolNova. Built for the little jobs.</div>
  </footer>;
}
function FooterGroup({ title, links, labels }: { title:string; links:string[]; labels:string[] }) { return <div><h2 className="mb-3 text-sm font-semibold">{title}</h2><div className="space-y-2">{links.map((href, i) => <Link key={href} href={href} data-testid={`link-footer-${i}`} className="block text-sm text-muted-foreground transition-colors hover:text-foreground">{labels[i]}</Link>)}</div></div>; }

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return <Link href={`/tools/${tool.slug}`} data-testid={`card-tool-${tool.slug}`} className="group flex min-h-[190px] flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_8px_30px_hsl(var(--foreground)/.035)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_35px_hsl(var(--foreground)/.08)]">
    <div className="mb-7 flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><Icon size={19}/></span><ArrowRight size={17} className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"/></div>
    <div className="mt-auto"><p className="mb-1 text-[11px] font-mono uppercase tracking-[.17em] text-muted-foreground">{tool.category}</p><h3 className="font-semibold tracking-tight">{tool.name}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{tool.description}</p></div>
  </Link>;
}

type UploaderProps = { accept: string; multiple?: boolean; maxSize?: number; onFiles: (files: File[]) => void; files?: File[]; label?: string };
export function FileUploader({ accept, multiple = false, maxSize = 25, onFiles, files = [], label = 'Drop a file here' }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null); const [drag, setDrag] = useState(false); const [error, setError] = useState('');
  const validate = (incoming: File[]) => { const accepted = accept.split(',').map((item) => item.trim().toLowerCase()); const typed = incoming.filter((file) => accepted.some((type) => type === '*' || type === file.type.toLowerCase() || (type.endsWith('/*') && file.type.toLowerCase().startsWith(type.slice(0,-1))))); const valid = typed.filter((file) => file.size <= maxSize * 1024 * 1024); if (typed.length !== incoming.length) setError('One or more files have an unsupported format.'); else if (valid.length !== typed.length) setError(`Files must be smaller than ${maxSize} MB.`); else setError(''); onFiles(multiple ? valid : valid.slice(0,1)); };
  const change = (event: ChangeEvent<HTMLInputElement>) => validate(Array.from(event.target.files ?? []));
  const drop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDrag(false); validate(Array.from(event.dataTransfer.files)); };
  return <div>
    <div onClick={() => inputRef.current?.click()} onDragOver={(e) => {e.preventDefault(); setDrag(true)}} onDragLeave={() => setDrag(false)} onDrop={drop} role="button" tabIndex={0} onKeyDown={(e) => {if(e.key === 'Enter' || e.key === ' ') inputRef.current?.click()}} data-testid="uploader-dropzone" className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${drag ? 'border-primary bg-secondary/70' : 'border-border hover:border-primary/50'}`}>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={change} className="hidden" data-testid="input-file-upload"/>
      <span className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-muted text-primary"><FileUp size={20}/></span><p className="font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">or click to browse · up to {maxSize} MB</p>
    </div>
    {error && <p className="mt-2 text-sm text-destructive" role="alert" data-testid="status-upload-error">{error}</p>}
    {files.length > 0 && <div className="mt-3 space-y-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm"><span className="truncate">{file.name}</span><span className="ml-3 flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground">{multiple&&<><button disabled={index===0} onClick={(event) => { event.stopPropagation(); const next=[...files]; [next[index-1],next[index]]=[next[index],next[index-1]]; onFiles(next); }} className="rounded-md p-1 hover:bg-background disabled:opacity-30" aria-label={`Move ${file.name} up`} data-testid={`button-move-file-up-${index}`}><ChevronUp size={13}/></button><button disabled={index===files.length-1} onClick={(event) => { event.stopPropagation(); const next=[...files]; [next[index],next[index+1]]=[next[index+1],next[index]]; onFiles(next); }} className="rounded-md p-1 hover:bg-background disabled:opacity-30" aria-label={`Move ${file.name} down`} data-testid={`button-move-file-down-${index}`}><ChevronDown size={13}/></button></>}<span>{(file.size/1024).toFixed(1)} KB</span><button onClick={(event) => { event.stopPropagation(); onFiles(files.filter((_, fileIndex) => fileIndex !== index)); }} className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-destructive" aria-label={`Remove ${file.name}`} data-testid={`button-remove-file-${index}`}><X size={14}/></button></span></div>)}</div>}
  </div>;
}

export function PrivacyNote() { return <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Check size={14} className="text-primary"/> Your files are processed locally in your browser whenever possible.</p>; }
export function ToolFrame({ children, title }: { children: ReactNode; title?: string }) { return <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_40px_hsl(var(--foreground)/.05)] sm:p-7" aria-label={title}>{children}</section>; }