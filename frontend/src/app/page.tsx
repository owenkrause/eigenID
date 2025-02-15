"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

export default function Home() {
  const [scene, setScene] = useState<0 | 1 | 2>(0);
  const [isTalking, setIsTalking] = useState(true);
  const [currentSprite, setCurrentSprite] = useState<"normal" | "talk">("normal");
  
  const sceneTexts = [
    "Hello my name is owen what is your name?",
    "Objection! That's clearly contradictory!",
    "Order in the court!"
  ];

  useEffect(() => {
    if (isTalking) {
      const sequence = async () => {
        setCurrentSprite("talk");
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentSprite("normal");
        setIsTalking(false);
      };
      sequence();
    }
  }, [isTalking]);

  const SceneSelector = ({ type }: { type: 0 | 1 | 2 }) => {
    switch(type) {
      case 0:
        return (
          <div className="relative w-[960px] h-[640px]">
            <Image className="absolute" src="/defense_background.jpg" alt="court background" width={960} height={640} />
            <Image className="absolute" src="/defense_stand.png" alt="court background" width={960} height={640} />
            {currentSprite === "normal" && (
              <Image className="absolute" src="/defense_smirk.gif" alt="" width={960} height={640} />
            )}
            {currentSprite === "talk" && (
              <Image className="absolute" src="/defense_talk.gif" alt="court background" width={960} height={640} />
            )}
          </div>
        )
      case 1:
        return (
          <div className="relative w-[960px] h-[640px]">
            <Image className="absolute" src="/prosecutor_background.jpg" alt="court background" width={960} height={640} />
            <Image className="absolute" src="/prosecutor_stand.png" alt="court background" width={960} height={640} />
            {currentSprite === "normal" && (
              <Image className="absolute" src="/prosecutor_normal.gif" alt="" width={960} height={640} />
            )}
            {currentSprite === "talk" && (
              <Image className="absolute" src="/prosecutor_talk.gif" alt="court background" width={960} height={640} />
            )}
          </div>
        )
      case 2:
        return (
          <div>
            <Image className="absolute" src="/judge_background.jpg" alt="court background" width={960} height={640} />
            <Image className="absolute" src="/judge_stand.png" alt="court background" width={960} height={640} />
            {currentSprite === "normal" && (
              <Image className="absolute" src="/judge_normal.gif" alt="court background" width={960} height={640} />
            )}
            {currentSprite === "talk" && (
              <Image className="absolute" src="/judge_talk.gif" alt="court background" width={960} height={640} />
            )}
          </div>
        )
    }
  }

  const TextOverlay = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
      setDisplayedText("");
      setCurrentIndex(0);
      setIsCompleted(false);
    }, [text]);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, 25);
  
        return () => clearTimeout(timer);
      } else setIsCompleted(true);
    }, [currentIndex, text]);

    return (
      <div 
        className={`absolute bottom-0 w-full p-6 bg-black/80 
          ${isCompleted ? "cursor-pointer" : ""}`}
        onClick={() => isCompleted && scene !== 2 && (
          setScene(((scene + 1) % 3) as 0 | 1 | 2),
          setIsTalking(true)
        )}
      >
        <div className="max-w-3xl mx-auto">
          <p className="inline text-white font-mono text-lg leading-relaxed">
            {displayedText}
          </p>
          {isCompleted && scene !== 2 && (
            <div className="inline text-gray-400 mt-2 animate-pulse">
              &emsp;(click)
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[960px] h-[640px]">
        <SceneSelector type={scene} />
        <TextOverlay text={sceneTexts[scene]} />
      </div>
    </div>
  );
}