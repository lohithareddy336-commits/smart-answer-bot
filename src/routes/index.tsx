import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { classify, INTENTS } from "@/lib/chatbot-nlp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learnflu AI Chatbot" },
      {
        name: "description",
        content:
          "Learnflu AI Chatbot — an NLP-powered assistant that answers 10 trained questions using intent classification.",
      },
      { property: "og:title", content: "Learnflu AI Chatbot" },
      {
        property: "og:description",
        content:
          "An NLP-powered chatbot that classifies user intent and responds from a trained dataset.",
      },
    ],
  }),
  component: Index,
});

type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
  meta?: { tag: string; confidence: number } | null;
};

function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text:
        "👋 Hi! I'm Learnflu — an NLP-powered chatbot trained on 10 questions. Ask me anything from the suggestions below, or type your own.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const result = classify(trimmed);
      const botMsg: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: result.response,
        meta: result.intent
          ? { tag: result.intent.tag, confidence: result.confidence }
          : null,
      };
      setMessages((m) => [...m, botMsg]);
      setTyping(false);
      inputRef.current?.focus();
    }, 450);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
            L
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Learnflu AI Chatbot</h1>
            <p className="text-xs text-slate-500">
              NLP + ML intent classifier · 10 trained questions
            </p>
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-xl shadow-indigo-100 backdrop-blur">
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-5"
            style={{ minHeight: "60vh", maxHeight: "65vh" }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-2.5 text-sm text-white shadow-md"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-800"
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  {m.meta && (
                    <p className="mt-1.5 text-[10px] uppercase tracking-wide text-slate-500">
                      intent: {m.meta.tag} · confidence{" "}
                      {(m.meta.confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="border-t border-slate-100 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {INTENTS.map((i) => (
                  <button
                    key={i.tag}
                    onClick={() => send(i.question)}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                  >
                    {i.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-4"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          Built with bag-of-words vectorization + cosine similarity intent
          classification.
        </p>
      </div>
    </div>
  );
}
