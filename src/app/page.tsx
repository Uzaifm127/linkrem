import Link from "next/link";
import {
  ArrowRight,
  BookmarkPlus,
  Check,
  Command,
  ExternalLink,
  Filter,
  Layers3,
  Link2,
  MousePointerClick,
  Puzzle,
  Search,
  Tags,
  Zap,
} from "lucide-react";
import AppIcon from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";

const savedLinks = [
  {
    name: "Design resources",
    url: "figma.com/community",
    tags: ["Design", "Work"],
  },
  {
    name: "Project documentation",
    url: "docs.example.com/project",
    tags: ["Work"],
  },
  {
    name: "Watch later",
    url: "youtube.com/playlist",
    tags: ["YouTube"],
  },
];

const features = [
  {
    icon: BookmarkPlus,
    title: "Save without breaking your flow",
    description:
      "Save the current page from the extension button or use a keyboard command when every second matters.",
    className: "lg:col-span-2",
    preview: (
      <div className="mt-8 flex items-center gap-3 rounded-lg border bg-background p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
          <BookmarkPlus className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">Save current page</p>
          <p className="truncate text-sm text-muted-foreground">
            Add it to Linkrem from any tab
          </p>
        </div>
        <kbd className="rounded-md border bg-white px-2 py-1 text-xs font-medium shadow-sm">
          Ctrl ⇧ L
        </kbd>
      </div>
    ),
  },
  {
    icon: Command,
    title: "Open links instantly",
    description:
      "Assign up to 10 quick-open shortcuts and reach important links without searching through bookmarks.",
    className: "",
    preview: (
      <div className="mt-8 flex flex-wrap gap-2">
        {["Ctrl", "Alt", "K"].map((key) => (
          <kbd
            key={key}
            className="min-w-12 rounded-md border bg-white px-3 py-2 text-center font-semibold shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    ),
  },
  {
    icon: Layers3,
    title: "Restore a complete workspace",
    description:
      "Save every useful tab in the current window as one session, then reopen the whole workspace together.",
    className: "",
    preview: (
      <div className="mt-8 space-y-2">
        {["Research", "Design", "Planning"].map((item, index) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-md border bg-white px-3 py-2 shadow-sm"
            style={{ marginLeft: `${index * 8}px` }}
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-medium">{item}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Search,
    title: "Find the right link quickly",
    description:
      "Search names and URLs, filter with tags, and keep active filters at the front where they are easy to manage.",
    className: "lg:col-span-2",
    preview: (
      <div className="mt-8 flex gap-2">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border bg-white px-3 text-sm text-muted-foreground shadow-sm">
          <Search className="h-4 w-4" />
          Search by link name or URL
        </div>
        <div className="flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white shadow">
          <Filter className="h-4 w-4" />
          Filter
        </div>
      </div>
    ),
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <AppIcon className="h-9 w-9" />
            <span className="text-xl font-bold">Linkrem</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-text-foreground md:flex">
            <Link href="#features" className="transition hover:text-primary">
              Features
            </Link>
            <Link href="#workflow" className="transition hover:text-primary">
              How it works
            </Link>
            <Link href="#extension" className="transition hover:text-primary">
              Extension
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="hidden text-text hover:bg-slate-100 hover:text-text sm:inline-flex"
            >
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">
                Get started
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pb-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(to_right,rgba(43,112,219,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(43,112,219,0.12)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-text-foreground shadow-sm">
              <Zap className="h-4 w-4 text-primary" />
              Your links, sessions and shortcuts in one place
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Stop looking for links.
              <span className="block text-primary">Open them instantly.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Linkrem keeps useful links and complete browser sessions easy to
              find, organize and reopen—through one focused app and its Chrome
              extension.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/login">
                  Start saving time
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full bg-white text-text hover:bg-slate-100 hover:text-text sm:w-auto"
              >
                <Link href="#workflow">
                  See how it works
                  <MousePointerClick />
                </Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-foreground">
              {["No browser bookmark lock-in", "Fast tag filtering", "Session restore"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-6xl lg:mt-20">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-2xl shadow-primary/10">
              <div className="flex h-14 items-center gap-3 border-b px-4 sm:px-6">
                <div className="hidden gap-1.5 sm:flex">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto flex h-9 w-full max-w-xl items-center justify-between rounded-md border bg-muted px-3 text-sm text-muted-foreground shadow-sm">
                  <span className="flex items-center gap-2 truncate">
                    <Search className="h-4 w-4" />
                    Search by link name or URLs
                  </span>
                  <kbd className="hidden font-medium sm:block">CTRL + K</kbd>
                </div>
              </div>

              <div className="grid min-h-[31rem] md:grid-cols-[13rem_1fr]">
                <aside className="hidden border-r bg-white p-4 md:block">
                  <div className="mb-8 flex items-center gap-2">
                    <AppIcon className="h-8 w-8" />
                    <span className="font-bold">Linkrem</span>
                  </div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Platform
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 rounded-md bg-background px-3 py-2 font-medium">
                      <Link2 className="h-4 w-4" /> Links
                    </div>
                    <div className="flex items-center gap-3 rounded-md px-3 py-2 text-text-foreground">
                      <Tags className="h-4 w-4" /> Tags
                    </div>
                    <div className="flex items-center gap-3 rounded-md px-3 py-2 text-text-foreground">
                      <Command className="h-4 w-4" /> Shortcuts
                    </div>
                  </div>
                </aside>

                <div className="bg-background p-4 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <Button className="bg-white text-text hover:bg-slate-100">
                      <Filter /> Filter
                    </Button>
                    <div className="flex rounded-md bg-white p-1 text-sm shadow-sm">
                      <span className="rounded-sm bg-primary px-3 py-1.5 font-medium text-white">
                        Link
                      </span>
                      <span className="px-3 py-1.5 text-muted-foreground">
                        Session
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {savedLinks.map((link, index) => (
                      <div
                        key={link.name}
                        className={`flex min-h-48 flex-col justify-between rounded-xl border bg-white p-5 shadow-sm ${
                          index === 2 ? "hidden lg:flex" : ""
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-bold">{link.name}</h3>
                            <ExternalLink className="h-5 w-5 text-text-foreground" />
                          </div>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {link.url}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {link.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-secondary/50 px-3 py-1 text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-5 flex h-9 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-white shadow">
                          <ExternalLink className="h-4 w-4" /> Open Link
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mx-auto -mt-20 w-[19rem] rounded-2xl border-2 border-primary bg-background p-3 shadow-xl sm:absolute sm:-bottom-10 sm:-right-4 sm:mt-0 lg:-right-8">
              <div className="mb-3 flex items-center justify-between border-b pb-3">
                <div className="flex gap-2">
                  {[BookmarkPlus, Command, Layers3].map((Icon, index) => (
                    <span
                      key={index}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  ))}
                </div>
                <Puzzle className="h-5 w-5 text-primary" />
              </div>
              <div className="mb-3 flex gap-2">
                <div className="flex h-9 flex-1 items-center rounded-md border bg-white px-3 text-xs text-muted-foreground">
                  Search links
                </div>
                <span className="flex h-9 items-center gap-1 rounded-md bg-primary px-2 text-xs font-medium text-white">
                  <Filter className="h-3.5 w-3.5" /> Filter
                </span>
              </div>
              <div className="space-y-2">
                {savedLinks.slice(0, 2).map((link) => (
                  <div key={link.name} className="rounded-md bg-white p-3 shadow-sm">
                    <p className="truncate text-sm font-semibold">{link.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {link.url}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Built for speed
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Less time managing. More time doing.
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Every part of Linkrem is designed to shorten the distance between
              remembering a link and opening it.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className={`group rounded-xl border bg-background p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.className}`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 max-w-xl leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                  {feature.preview}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              One simple workflow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Save once. Find it anywhere.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: Puzzle,
                title: "Save from the extension",
                text: "Keep the current page or capture every useful tab in your browser window.",
              },
              {
                number: "02",
                icon: Tags,
                title: "Organize in the app",
                text: "Add clear tags, build sessions and assign shortcuts to the links you use most.",
              },
              {
                number: "03",
                icon: Zap,
                title: "Open without delay",
                text: "Search, filter, press a shortcut or restore a complete workspace in one action.",
              },
            ].map((step) => {
              const Icon = step.icon;

              return (
                <article key={step.number} className="relative rounded-xl border bg-white p-6 shadow-sm">
                  <span className="absolute right-5 top-4 text-4xl font-bold text-primary/10">
                    {step.number}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/50 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 leading-6 text-muted-foreground">{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="extension" className="px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl bg-primary px-6 py-12 text-white shadow-xl sm:px-10 lg:flex-row lg:px-14">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
              <Puzzle className="h-4 w-4" />
              App + Chrome extension
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your fastest route back to useful work.
            </h2>
            <p className="mt-4 leading-7 text-white/80">
              Keep your library outside one browser&apos;s bookmark folder and
              make every saved link easier to reach.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full shrink-0 bg-white text-primary hover:bg-slate-100 sm:w-auto"
          >
            <Link href="/auth/login">
              Get started with Linkrem
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <AppIcon className="h-8 w-8" />
            <span className="font-bold">Linkrem</span>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            Save links. Restore sessions. Get back to work faster.
          </p>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-text-foreground transition hover:text-primary"
          >
            Sign in
          </Link>
        </div>
      </footer>
    </main>
  );
}
