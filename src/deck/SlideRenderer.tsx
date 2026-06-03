import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Slide } from "./types";
import { CountUp, StaggerWords } from "./primitives";
import { CodeBlock } from "./CodeBlock";
import { useSlideStep } from "./steps";
import { FlowchartSlide } from "./FlowchartSlide";
import { BenefitsSlide } from "./BenefitsSlide";
import { slides } from "./slides";

const EASE = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: EASE },
};

export function SlideRenderer({
  slide,
  index,
  onNavigate
}: {
  slide: Slide;
  index: number;
  onNavigate?: (slideIndex: number) => void;
}) {
  const { step } = useSlideStep();
  switch (slide.type) {
    case "title": {
      const reveals = slide.reveals ?? [];
      const hasReveals = reveals.length > 0;
      const hasQr = !!slide.qr;
      const hasSide = hasReveals || hasQr;
      const visible = Math.min(step, reveals.length);
      return (
        <div className={`grid h-full w-full ${hasSide ? "lg:grid-cols-[1.1fr_1fr]" : "grid-cols-1"} items-center gap-10 px-[8vw] py-[6vh]`}>
          <div className="flex flex-col justify-center">
            <motion.div {...fade} className="flex items-center gap-3 mb-8">
              <Badge variant="outline" className="font-mono text-xs border-accent/40 text-accent">
                <span className="mr-1.5">$</span> ./talk --start
              </Badge>
              <Separator orientation="vertical" className="h-4" />
              <span className="font-mono text-xs text-muted-foreground">
                slide {String(index + 1).padStart(2, "0")}
              </span>
            </motion.div>
            <h1 className={`font-mono font-bold ${hasSide ? "text-[clamp(2rem,5vw,5rem)]" : "text-[clamp(2.5rem,7vw,7rem)]"} leading-[1.02] tracking-tight`}>
              <StaggerWords text={slide.heading} className="blink-cursor" />
            </h1>
            {slide.subtitle && (
              <motion.p
                {...fade}
                transition={{ ...fade.transition, delay: 0.5 }}
                className="mt-8 max-w-2xl text-xl text-muted-foreground font-light"
              >
                {slide.subtitle}
              </motion.p>
            )}
            {(slide.author || slide.date) && (
              <motion.div
                {...fade}
                transition={{ ...fade.transition, delay: 0.7 }}
                className="mt-10 flex items-center gap-4 font-mono text-sm text-muted-foreground"
              >
                {slide.author && <span className="text-foreground">{slide.author}</span>}
                {slide.author && slide.date && <span className="text-accent">//</span>}
                {slide.date && <span>{slide.date}</span>}
              </motion.div>
            )}
          </div>

          {hasReveals && (
            <div className="relative flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                {reveals.map((r, idx) => {
                  const shown = idx < visible;
                  return (
                    <AnimatePresence key={r.handle} mode="popLayout">
                      {shown && (
                        <motion.figure
                          initial={{ opacity: 0, y: 24, scale: 0.92, rotate: -2 }}
                          animate={{ opacity: 1, y: 0, scale: 1, rotate: idx % 2 === 0 ? -1.5 : 1.5 }}
                          exit={{ opacity: 0, y: 24, scale: 0.92 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="group relative"
                        >
                          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-card accent-glow">
                            <img
                              src={r.src}
                              alt={r.alt}
                              loading="lazy"
                              width={768}
                              height={960}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-3">
                              <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
                                #{String(idx + 1).padStart(2, "0")}
                              </div>
                              <div className="font-mono text-sm font-bold leading-tight mt-0.5 truncate">
                                {r.name}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground truncate">
                                {r.handle}
                              </div>
                            </div>
                          </div>
                        </motion.figure>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>
              {visible < reveals.length && (
                <div className="absolute -bottom-8 left-0 right-0 text-center font-mono text-[11px] text-muted-foreground">
                  <span className="text-accent">→</span> press space to reveal ({visible}/{reveals.length})
                </div>
              )}
            </div>
          )}

          {hasQr && slide.qr && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="rounded-2xl border border-accent/40 bg-card/60 p-6 accent-glow">
                <img
                  src={slide.qr.src}
                  alt={slide.qr.label}
                  className="w-[280px] h-[280px] [image-rendering:pixelated]"
                />
              </div>
              <div className="mt-5 font-mono text-sm text-foreground">
                {slide.qr.label}
              </div>
              {slide.qr.caption && (
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  <span className="text-accent">&gt;</span> {slide.qr.caption}
                </div>
              )}
            </motion.div>
          )}
        </div>
      );
    }



    case "section":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono text-[clamp(8rem,18vw,18rem)] font-bold leading-none text-accent text-accent-glow"
          >
            {slide.number}
          </motion.div>
          <motion.div
            {...fade}
            transition={{ ...fade.transition, delay: 0.3 }}
            className="mt-4 font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground"
          >
            ── section ──
          </motion.div>
          <motion.h2
            {...fade}
            transition={{ ...fade.transition, delay: 0.45 }}
            className="mt-6 text-5xl font-light"
          >
            {slide.name}
          </motion.h2>
        </div>
      );

    case "bullets":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[10vw]">
          <motion.h2
            {...fade}
            className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] mb-12 tracking-tight"
          >
            {slide.heading}
          </motion.h2>
          <ul className="space-y-6 max-w-4xl">
            {slide.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.15 + i * 0.1,
                  ease: EASE,
                }}
                className="flex items-start gap-5 text-2xl md:text-3xl font-light"
              >
                <span className="font-mono text-accent text-2xl mt-1.5 select-none">
                  {slide.prefix ?? "—"}
                </span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      );

    case "code":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[8vw] py-[6vh]">
          <motion.div {...fade} className="mb-6 flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              {slide.language}
            </Badge>
            <span className="font-mono text-sm text-muted-foreground">
              {slide.title}
            </span>
          </motion.div>
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.15 }}>
            <CodeBlock
              code={slide.code}
              language={slide.language}
              filename={slide.filename}
              typewriter
            />
          </motion.div>
          {slide.caption && (
            <motion.p
              {...fade}
              transition={{ ...fade.transition, delay: 0.4 }}
              className="mt-6 font-mono text-sm text-muted-foreground"
            >
              <span className="text-accent">&gt;</span> {slide.caption}
            </motion.p>
          )}
        </div>
      );

    case "compare":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[10vw]">
          <motion.h2
            {...fade}
            className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] mb-12 tracking-tight"
          >
            {slide.heading}
          </motion.h2>
          <Tabs defaultValue="split" className="w-full">
            <TabsList className="font-mono mb-6">
              <TabsTrigger value="split">split</TabsTrigger>
              <TabsTrigger value="left">{slide.left.label.toLowerCase()}</TabsTrigger>
              <TabsTrigger value="right">{slide.right.label.toLowerCase()}</TabsTrigger>
            </TabsList>
            <TabsContent value="split">
              <div className="grid grid-cols-2 gap-6">
                {[slide.left, slide.right].map((col, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 + idx * 0.12 }}
                  >
                    <Card className="p-8 h-full bg-card/60 border-border">
                      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                        {idx === 0 ? "// before" : "// after"}
                      </div>
                      <div
                        className={`font-mono text-2xl font-bold mb-6 ${idx === 1 ? "text-accent" : ""}`}
                      >
                        {col.label}
                      </div>
                      <Separator className="mb-6" />
                      <ul className="space-y-3 text-lg font-light">
                        {col.items.map((it, j) => (
                          <li key={j} className="flex gap-3">
                            <span className="font-mono text-muted-foreground">
                              {String(j + 1).padStart(2, "0")}
                            </span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="left">
              <SimpleList label={slide.left.label} items={slide.left.items} />
            </TabsContent>
            <TabsContent value="right">
              <SimpleList label={slide.right.label} items={slide.right.items} accent />
            </TabsContent>
          </Tabs>
        </div>
      );

    case "stat":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center text-center px-[10vw]">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-mono font-bold text-[clamp(7rem,22vw,22rem)] leading-none text-accent text-accent-glow"
          >
            <CountUp value={slide.value} prefix={slide.prefix} suffix={slide.suffix} />
          </motion.div>
          <motion.div
            {...fade}
            transition={{ ...fade.transition, delay: 0.4 }}
            className="mt-8 max-w-3xl text-2xl md:text-3xl font-light"
          >
            {slide.label}
          </motion.div>
          {slide.detail && (
            <motion.div
              {...fade}
              transition={{ ...fade.transition, delay: 0.55 }}
              className="mt-6 font-mono text-sm text-muted-foreground"
            >
              <span className="text-accent">$</span> source — {slide.detail}
            </motion.div>
          )}
        </div>
      );

    case "quote":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[12vw]">
          <motion.div
            {...fade}
            className="font-mono text-[10rem] leading-none text-accent/60 select-none"
          >
            “
          </motion.div>
          <motion.blockquote
            {...fade}
            transition={{ ...fade.transition, delay: 0.15 }}
            className="text-3xl md:text-5xl font-light italic max-w-5xl leading-tight -mt-6"
          >
            {slide.text}
          </motion.blockquote>
          <motion.div
            {...fade}
            transition={{ ...fade.transition, delay: 0.4 }}
            className="mt-10 font-mono text-sm text-muted-foreground flex items-center gap-3"
          >
            <span className="h-px w-12 bg-accent" />
            <span className="text-foreground">{slide.attribution}</span>
            {slide.role && <span>· {slide.role}</span>}
          </motion.div>
        </div>
      );

    case "image":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-[8vw] py-[6vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative max-h-[75vh] w-full overflow-hidden rounded-lg border border-border accent-glow"
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-full w-full object-cover max-h-[75vh]"
            />
          </motion.div>
          {slide.caption && (
            <motion.p
              {...fade}
              transition={{ ...fade.transition, delay: 0.3 }}
              className="mt-6 font-mono text-sm text-muted-foreground"
            >
              <span className="text-accent">#</span> {slide.caption}
            </motion.p>
          )}
        </div>
      );

    case "imageGrid":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[8vw] py-[6vh]">
          <motion.h2
            {...fade}
            className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] mb-12 tracking-tight"
          >
            {slide.heading}
          </motion.h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-3 max-w-7xl">
            {slide.images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: EASE }}
                className="group relative flex items-center justify-center p-4 rounded-md border border-border bg-card hover:border-accent/60 hover:accent-glow transition-all min-h-[120px]"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
          {slide.caption && (
            <motion.p
              {...fade}
              transition={{ ...fade.transition, delay: 0.8 }}
              className="mt-8 font-mono text-sm text-muted-foreground text-center"
            >
              <span className="text-accent">#</span> {slide.caption}
            </motion.p>
          )}
        </div>
      );

    case "verticalWord":
      return (
        <div className="relative flex h-full w-full items-center px-[10vw] py-[8vh]">
          <div className="flex flex-col">
            {slide.words.map((word, idx) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.08 + idx * 0.1,
                  ease: EASE,
                }}
                className="font-mono text-[clamp(2.8rem,7vw,7rem)] leading-[0.95] tracking-tight"
              >
                <span className="font-extrabold text-accent text-accent-glow">
                  {word.charAt(0)}
                </span>
                <span className="font-light">
                  {word.slice(1)}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35, ease: EASE }}
            className="absolute bottom-[4vh] right-[2vw] w-[520px] md:w-[680px] lg:w-[800px]"
          >
            <img
              src={slide.meme.src}
              alt={slide.meme.alt}
              loading="lazy"
              className="h-auto w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
            />
          </motion.div>
        </div>
      );

    case "bio":
      return (
        <div className="grid h-full w-full items-center gap-10 px-[8vw] py-[6vh] lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: -24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-accent/30 bg-card/60 accent-glow">
              <img
                src={slide.image.src}
                alt={slide.image.alt}
                loading="lazy"
                className="aspect-[4/5] h-full w-full object-cover"
              />
            </div>
          </motion.div>

          <div className="flex flex-col justify-center">
            <motion.div {...fade} className="mb-8 flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs border-accent/40 text-accent">
                <span className="mr-1.5">@</span> speaker.bio
              </Badge>
              <Separator orientation="vertical" className="h-4" />
              <span className="font-mono text-xs text-muted-foreground">
                profile --summary
              </span>
            </motion.div>

            <motion.h2
              {...fade}
              transition={{ ...fade.transition, delay: 0.1 }}
              className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] tracking-tight"
            >
              <StaggerWords text={slide.heading} className="blink-cursor" />
            </motion.h2>

            <ul className="mt-10 space-y-6 max-w-4xl">
              {slide.items.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.2 + idx * 0.1,
                    ease: EASE,
                  }}
                  className="flex items-start gap-4 text-xl md:text-2xl font-light"
                >
                  <span className="mt-1 font-mono text-accent select-none">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "logo":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-[10vw]">
          <motion.div {...fade} className="mb-10 flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span>live · twitch.tv</span>
          </motion.div>
          <motion.img
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            src={slide.src}
            alt={slide.alt}
            loading="lazy"
            className="max-h-[55vh] max-w-[70vw] w-auto h-auto drop-shadow-[0_0_60px_rgba(145,70,255,0.45)]"
          />
          {slide.caption && (
            <motion.p
              {...fade}
              transition={{ ...fade.transition, delay: 0.4 }}
              className="mt-12 font-mono text-base text-muted-foreground"
            >
              <span className="text-accent">&gt;</span> {slide.caption}
            </motion.p>
          )}
        </div>
      );

    case "question":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[10vw]">
          <motion.div {...fade} className="flex items-center gap-3 mb-10">
            <Badge variant="outline" className="font-mono text-xs border-accent/40 text-accent">
              <span className="mr-1.5">?</span> prompt
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-mono text-xs text-muted-foreground">
              ask --honest
            </span>
          </motion.div>
          <div className="flex items-start gap-4 md:gap-6">
            <motion.span
              {...fade}
              className="font-mono text-accent text-[clamp(2rem,5vw,5rem)] leading-[1.05] select-none"
            >
              &gt;
            </motion.span>
            <h2 className="font-mono font-bold text-[clamp(2rem,6vw,6rem)] leading-[1.05] tracking-tight">
              <StaggerWords text={slide.question} className="blink-cursor" />
            </h2>
          </div>
          {slide.hint && (
            <motion.p
              {...fade}
              transition={{ ...fade.transition, delay: 0.6 }}
              className="mt-12 ml-10 md:ml-16 font-mono text-sm text-muted-foreground"
            >
              <span className="text-accent">//</span> {slide.hint}
            </motion.p>
          )}
        </div>
      );

    case "formula":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[10vw] py-[6vh]">
          <motion.h2
            {...fade}
            className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] mb-16 tracking-tight"
          >
            {slide.heading}
          </motion.h2>
          <div className="space-y-12 max-w-5xl">
            {slide.rows.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.25, ease: EASE }}
                className="flex flex-col gap-3"
              >
                <div className={`font-mono text-xs uppercase tracking-[0.3em] ${row.accent ? "text-accent" : "text-muted-foreground"}`}>
                  {row.label}
                </div>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 font-mono text-[clamp(1.5rem,3.5vw,3rem)] font-bold">
                  {row.terms.map((term, j) => {
                    const isOp = j > 0 && j < row.terms.length;
                    const op = j === row.terms.length - 1 ? "=" : "+";
                    return (
                      <span key={j} className="flex items-center gap-4 md:gap-6">
                        {isOp && (
                          <span className={row.accent ? "text-accent" : "text-muted-foreground"}>
                            {op}
                          </span>
                        )}
                        <span className={`px-4 py-2 rounded border ${row.accent ? "border-accent/50 text-accent accent-glow" : "border-border text-foreground"}`}>
                          {term}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
          {slide.caption && (
            <motion.p
              {...fade}
              transition={{ ...fade.transition, delay: 0.9 }}
              className="mt-12 font-mono text-sm text-muted-foreground"
            >
              <span className="text-accent">//</span> {slide.caption}
            </motion.p>
          )}
        </div>
      );

    case "jobsGrid":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[8vw] py-[6vh]">
          <motion.h2
            {...fade}
            className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] mb-12 tracking-tight"
          >
            {slide.heading}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl">
            {slide.jobs.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE }}
              >
                <Card className="group relative h-full p-8 bg-card/60 border-border hover:border-accent/60 hover:accent-glow transition-all overflow-hidden">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="font-mono text-[5rem] font-bold text-accent leading-none mb-4">
                      {job.tag}
                    </div>
                    <div className="font-mono text-2xl font-bold mb-2 leading-tight">
                      {job.title}
                    </div>
                  </div>
                  <Separator className="mb-4" />
                  <p className="text-base font-light text-muted-foreground leading-snug text-center">
                    {job.blurb}
                  </p>
                  <div className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "skillsCode": {
      const lines: { text: string; cls: string }[] = [
        { text: "// skills.ts", cls: "text-muted-foreground" },
        { text: "const skills = {", cls: "text-foreground" },
      ];
      slide.skills.forEach((s) => {
        lines.push({
          text: `  ${s.name}: "${s.why}",`,
          cls: "text-foreground",
        });
      });
      lines.push({ text: "};", cls: "text-foreground" });
      lines.push({ text: "", cls: "" });
      lines.push({ text: "export default skills;", cls: "text-accent" });
      return (
        <div className="flex h-full w-full flex-col justify-center px-[8vw] py-[6vh]">
          <motion.h2
            {...fade}
            className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] mb-10 tracking-tight"
          >
            {slide.heading}
          </motion.h2>
          <div className="flex items-center gap-8 max-w-7xl">
            <motion.div
              {...fade}
              transition={{ ...fade.transition, delay: 0.2 }}
              className="rounded-lg overflow-hidden border border-border bg-card shadow-2xl flex-1"
            >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
              <span className="h-3 w-3 rounded-full bg-[oklch(0.65_0.22_25)]" />
              <span className="h-3 w-3 rounded-full bg-[oklch(0.82_0.17_85)]" />
              <span className="h-3 w-3 rounded-full bg-[oklch(0.78_0.2_145)]" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">skills.ts</span>
            </div>
            <pre className="font-mono text-[clamp(1rem,1.6vw,1.4rem)] leading-relaxed p-8 overflow-auto">
              {lines.map((ln, i) => {
                const skillIdx = i - 2;
                const isSkillLine = skillIdx >= 0 && skillIdx < slide.skills.length;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.18, ease: EASE }}
                    className="flex"
                  >
                    <span className="select-none w-8 text-right pr-4 text-muted-foreground/50">
                      {i + 1}
                    </span>
                    {isSkillLine ? (
                      <span>
                        <span className="text-foreground">  </span>
                        <span className="text-accent">{slide.skills[skillIdx].name}</span>
                        <span className="text-foreground">: </span>
                        <span className="text-[oklch(0.78_0.2_145)]">"{slide.skills[skillIdx].why}"</span>
                        <span className="text-foreground">,</span>
                      </span>
                    ) : (
                      <span className={ln.cls}>{ln.text}</span>
                    )}
                  </motion.div>
                );
              })}
            </pre>
            </motion.div>
            {slide.logo && (
              <motion.div
                {...fade}
                transition={{ ...fade.transition, delay: 0.4 }}
                className="flex-shrink-0"
              >
                <img
                  src={slide.logo.src}
                  alt={slide.logo.alt}
                  className="w-64 h-auto"
                />
              </motion.div>
            )}
          </div>
        </div>
      );
    }

    case "flowchart": {
      const handleNavigate = (targetSlideId: string) => {
        const targetIndex = slides.findIndex(s => s.id === targetSlideId);
        if (targetIndex !== -1 && onNavigate) {
          onNavigate(targetIndex);
        }
      };

      return <FlowchartSlide slide={slide} onNavigate={handleNavigate} />;
    }

    case "benefits":
      return <BenefitsSlide heading={slide.heading} benefits={slide.benefits} />;

    case "timeline":
      return (
        <div className="flex h-full w-full flex-col justify-center px-[8vw] py-[6vh]">
          <motion.h2
            {...fade}
            className="font-mono font-bold text-[clamp(2rem,5vw,4.5rem)] mb-4 tracking-tight"
          >
            {slide.heading}
          </motion.h2>
          {slide.disclaimer && (
            <motion.p
              {...fade}
              transition={{ ...fade.transition, delay: 0.15 }}
              className="font-mono text-xs text-muted-foreground mb-12 max-w-4xl"
            >
              <span className="text-accent">*</span> {slide.disclaimer}
            </motion.p>
          )}
          
          <div className="relative max-w-6xl">
            {/* Timeline line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-border" />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
              className="absolute top-12 left-0 right-0 h-0.5 bg-accent origin-left"
              style={{ boxShadow: "0 0 8px oklch(0.86 0.24 152 / 0.6)" }}
            />

            {/* Milestones */}
            <div className="grid grid-cols-3 gap-8">
              {slide.milestones.map((milestone, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.2, ease: EASE }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.2, ease: EASE }}
                      className="w-6 h-6 rounded-full bg-accent border-4 border-background"
                      style={{ boxShadow: "0 0 16px oklch(0.86 0.24 152 / 0.8)" }}
                    />
                  </div>

                  {/* Period label */}
                  <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 rounded-lg bg-accent/10 border border-accent/30">
                      <span className="font-mono text-2xl font-bold text-accent">
                        {milestone.period}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {milestone.items.map((item, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 + i * 0.2 + j * 0.1, ease: EASE }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-accent mt-1 flex-shrink-0">•</span>
                        <span className="text-foreground leading-relaxed">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );
  }
}

function SimpleList({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <Card className="p-8 bg-card/60">
      <div className={`font-mono text-2xl font-bold mb-6 ${accent ? "text-accent" : ""}`}>
        {label}
      </div>
      <Separator className="mb-6" />
      <ul className="space-y-3 text-lg font-light">
        {items.map((it, j) => (
          <li key={j} className="flex gap-3">
            <span className="font-mono text-muted-foreground">
              {String(j + 1).padStart(2, "0")}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
