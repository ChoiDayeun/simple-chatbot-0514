"use client";

import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import { Chat } from "@/components/Chat";

export default function Home() {
  /*
    메시지 목록을 저장하는 상태로, 메시지의 형태는 다음과 같음
    { role: "user" | "model", parts: [{ text: string }] }

    ex)
    [
      { role: "model", content: "안녕? 나는 엘리엇이야. 오늘은 무슨 일이 있었니?" }
      { role: "user", content: "오늘 재미난 일이 있었어! 한 번 들어볼래?" },
      ...
    ]
  */
  const [messages, setMessages] = useState([]);
  // 메시지를 전송 중인지 여부를 저장하는 상태
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // 메시지 목록을 끝으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지를 전송하는 함수
  const handleSend = async (message) => {
    // message 를 받아 메시지 목록에 추가
    // message 형태 = { role: "user", parts: [{ text: string }] }
    // ChatInput.js 26번째 줄 참고
    const updatedMessages = [...messages, message];
    // console.log(updatedMessages);
    // console.log(updatedMessages.slice(-6));

    setMessages(updatedMessages);
    // 메시지 전송 중임을 표시
    setLoading(true);

    // /api/chat 에 메시지 목록을 전송하고 응답을 받음
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 메시지 목록의 첫번째를 제외하고 전송
        // Gemini AI는 첫번째 메시지를 항상 user로 보내야 함
        messages: updatedMessages.slice(1),
      }),
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(response.statusText);
    }

    // 응답을 JSON 형태로 변환
    // 비동기 API 를 사용하여 응답을 받기 때문에 await 사용
    const result = await response.json();

    if (!result) {
      return;
    }

    // console.log(result);

    // 로딩 상태를 해제하고, 메시지 목록에 응답을 추가
    setLoading(false);
    setMessages((messages) => [...messages, result]);
  };

  // 메시지 목록을 초기화하는 함수
  // 처음 시작할 메시지를 설정
  const handleReset = () => {
    setMessages([
      {
        role: "model",
        parts: [{ text: "안녕? 나는 마라야. 너의 AI 친구😉 오늘은 무슨 일이 있었니?" }],
      },
    ]);
  };

  // 메시지 목록이 업데이트 될 때마다 맨 아래로 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 컴포넌트가 처음 렌더링 될 때 메시지 목록을 초기화
  useEffect(() => {
    handleReset();
  }, []);

  return (
    <>
      <Head>
        <title>A Simple Chatbot</title>
        <meta name="description" content="A Simple Chatbot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen bg-white ">
        <div className="flex h-[50px] sm:h-[60px] border-b border-neutral-300 py-2 px-2 sm:px-8 items-center justify-between">
          <div className="font-bold text-3xl flex text-center">
            <a
              className="ml-2 hover:opacity-50 text-black"
              href="https://code-scaffold.vercel.app"
            >
              A Simple Chatbot
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
          <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
            {/*
              메인 채팅 컴포넌트
              messages: 메시지 목록
              loading: 메시지 전송 중인지 여부
              onSendMessage: 메시지 전송 함수
            */}
            <Chat
              messages={messages}
              loading={loading}
              onSendMessage={handleSend}
            />
            {/* 메시지 목록의 끝으로 스크롤하기 위해 참조하는 엘리먼트 */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex h-[30px] sm:h-[50px] border-t border-neutral-300 py-2 px-8 items-center sm:justify-between justify-center"></div>
      </div>
    </>
  );
}