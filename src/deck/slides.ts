import type { Slide } from "./types";
import ytQr from "@/assets/yt-qr.svg";
import bobLogo from "@/assets/boblogo.svg";
import headshot from "@/assets/headshot.jpg";
import manTouchingFace from "@/assets/mantouchingface.png";
import client1 from "@/assets/clients/Picture 1.png";
import client2 from "@/assets/clients/Picture 2.png";
import client3 from "@/assets/clients/Picture 3.png";
import client4 from "@/assets/clients/Picture 4.png";
import client5 from "@/assets/clients/Picture 5.png";
import client6 from "@/assets/clients/Picture 6.png";
import client7 from "@/assets/clients/Picture 7.png";
import client8 from "@/assets/clients/Picture 8.png";
import client9 from "@/assets/clients/Picture 9.webp";
import client10 from "@/assets/clients/Picture 10.png";
import client11 from "@/assets/clients/Picture 11.png";
import client12 from "@/assets/clients/Picture 12.png";
import benefit1 from "@/assets/benefits/benefit_1.png";
import benefit2 from "@/assets/benefits/benefit_2.png";
import benefit3 from "@/assets/benefits/benefit_3.jpeg";
import benefit4 from "@/assets/benefits/benefit_4.png";

export const slides: Slide[] = [
  {
    id: "intro",
    type: "title",
    title: "Intro",
    heading: "Bob 101",
    subtitle: "Everything you ever wanted to know about my old mate Bob...but fast",
    author: "Nicholas Renotte",
    date: "May 21, 2026",
  },
  {
    id: "bio",
    type: "bio",
    title: "Bio",
    heading: "who am I?",
    image: {
      src: headshot,
      alt: "Nicholas Renotte headshot",
    },
    items: [
      "Global Head of AI Developer Advocacy at IBM.",
      "Built machine learning models for Fortune 500 companies and founded an EdTech startup.",
      "Built a following of over 300,000 AI engineers and data scientists on YouTube over the past 5 years.",
      "Created hundreds of machine learning models and shared over 50,000 lines of code on GitHub.",
    ],
  },
  {
    id: "agenda",
    type: "flowchart",
    title: "Agenda",
    rootNode: {
      id: "root",
      label: "agenda",
    },
    nodes: [
      {
        id: "what-is-bob-node",
        label: "what_is_bob()",
        targetSlideId: "what-is-bob",
      },
      {
        id: "why-use-bob-node",
        label: "why_use_bob()",
        targetSlideId: "why-use-bob",
      },
      {
        id: "what-does-it-support-node",
        label: "what_does_it_support()",
        targetSlideId: "bob-adoption",
      },
    ],
  },
  {
    id: "software-developers-living-carefree",
    type: "verticalWord",
    title: "Software Developers Living Carefree",
    words: ["Software", "Developers", "Living", "Carefree"],
    meme: {
      src: manTouchingFace,
      alt: "Man touching face meme",
    },
  },
  {
    id: "what-is-bob",
    type: "skillsCode",
    title: "What is Bob?",
    heading: "what is Bob?",
    skills: [
      {
        name: "ai_enabled_ide",
        why: "multi-language support: Java, Python, JavaScript, TypeScript, Go, C++, Kotlin, Bash, plus legacy languages like RPG, COBOL, and PL/SQL",
      },
      {
        name: "custom_modes",
        why: "specialised personas for specialised capabilities",
      },
      {
        name: "secure_coding",
        why: "integrated with IBM SecureCode tools; Bob shifts security left by identifying vulnerabilities before build time",
      },
    ],
    logo: {
      src: bobLogo,
      alt: "Bob Logo",
    },
  },
  {
    id: "why-use-bob",
    type: "benefits",
    title: "Why use Bob?",
    heading: "why use Bob?",
    benefits: [
      {
        title: "Bobcoins & Boblytics",
        description:
          "Simpler usage tracking via Bobcoins and Boblytics; Bob intelligently selects the right model for each task.",
        imageSrc: benefit1,
      },
      {
        title: "Bob Findings",
        description:
          "Agentic capabilities let Bob take initiative, suggest improvements, and anticipate issues.",
        imageSrc: benefit2,
      },
      {
        title: "IDE Integration",
        description:
          "Extensive IDE and Bobshell integration across macOS, Windows, and Linux, with extensibility for Z and i.",
        imageSrc: benefit3,
      },
      {
        title: "Extensibility",
        description: "MCP support, Subtasks, Skills.",
        imageSrc: benefit4,
      },
    ],
  },
  {
    id: "bob-adoption",
    type: "jobsGrid",
    title: "We're using this ourselves",
    heading: "we're using this ourselves",
    jobs: [
      {
        title: "Global Developers",
        tag: "80,000",
        blurb: "developers using Bob worldwide",
      },
      {
        title: "IBM Adoption",
        tag: "95%",
        blurb: "of IBM devs are using Bob across the SDLC",
      },
      {
        title: "Productivity Gains",
        tag: "45%",
        blurb: "average productivity improvement",
      },
    ],
  },
  {
    id: "demo",
    type: "question",
    title: "Demo",
    question: "what can we build in 10 minutes?",
    hint: "demo time.",
  },
  {
    id: "case-studies",
    type: "imageGrid",
    title: "Clients using it",
    heading: "devs currently using it",
    images: [
      { src: client1, alt: "Client 1" },
      { src: client2, alt: "Client 2" },
      { src: client3, alt: "Client 3" },
      { src: client4, alt: "Client 4" },
      { src: client5, alt: "Client 5" },
      { src: client6, alt: "Client 6" },
      { src: client7, alt: "Client 7" },
      { src: client8, alt: "Client 8" },
      { src: client9, alt: "Client 9" },
      { src: client10, alt: "Client 10" },
      { src: client11, alt: "Client 11" },
      { src: client12, alt: "Client 12" },
    ],
    caption: "real-world Bob implementations",
  },
  {
    id: "future-state",
    type: "timeline",
    title: "Future State",
    heading: "future state roadmap",
    disclaimer: "subject to change — forward-looking statements disclaimer applies",
    milestones: [
      {
        period: "Q2",
        items: ["Subagents", "Skills", "IDP integration for SSO"],
      },
      {
        period: "Q3",
        items: ["Hooks", "Background Agents", "On Prem", "Task offload to cloud"],
      },
      {
        period: "Q4",
        items: ["IDE Agent View", "Webhook Trigger", "ISO 27001"],
      },
    ],
  },
  {
    id: "outro",
    type: "title",
    title: "Thanks",
    heading: "Go build something amazing.",
    subtitle: "GitHub.com/nicknochnack",
    author: "Nicholas Renotte",
    date: "@nicknochnack",
    qr: {
      src: ytQr,
      label: "youtube.com/@NicholasRenotte",
      caption: "scan to follow on YouTube",
    },
  },
];
