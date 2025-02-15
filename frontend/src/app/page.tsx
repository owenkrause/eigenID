"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  person1Argument: z.string().min(1, {
    message: "Argument cannot be empty",
  }),
  person2Argument: z.string().min(1, {
    message: "Argument cannot be empty",
  }),
})

export default function Home() {
  const [scene, setScene] = useState<0 | 1 | 2>(0);
  const [currentSprite, setCurrentSprite] = useState<"normal" | "talk">("normal");
  const [showForm, setShowForm] = useState(true);
  const [args, setArguments] = useState<{
    person1: string;
    person2: string;
  } | null>(null);
  const [judgeResponse, setJudgeResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Generate scene texts based on form values and API response
  const getSceneTexts = () => {
    if (!args) return ["Please submit your arguments first.", "", ""];
    
    return [
      `Person 1: ${args.person1}`,
      `Person 2: ${args.person2}`,
      judgeResponse ? 
        `Judge: ${judgeResponse}` : 
        isLoading ? 
          "Judge: Deliberating..." :
          "Judge: After hearing both arguments, I will now make my decision..."
    ];
  };

  const handleSceneTransition = async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSprite("talk");
    
    // Talk animation
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentSprite("normal");
    
    // Wait for sprite to return to normal before changing scene
    await new Promise(resolve => setTimeout(resolve, 100));
    setScene(((scene + 1) % 3) as 0 | 1 | 2);
    
    setIsTransitioning(false);
  };

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
          <div className="relative w-[960px] h-[640px]">
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
      } else {
        setIsCompleted(true);
        if (scene === 2 && !judgeResponse && !isLoading) {
          handleJudgeDecision();
        }
      }
    }, [currentIndex, text, scene, judgeResponse, isLoading]);

    return (
      <div 
        className={`absolute bottom-0 w-full p-6 bg-black/80 
          ${isCompleted && scene !== 2 && !isTransitioning ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (isCompleted && scene !== 2 && !isTransitioning) {
            handleSceneTransition();
          }
        }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="inline text-white font-mono text-lg leading-relaxed">
            {displayedText}
          </p>
          {isCompleted && scene !== 2 && !isTransitioning && (
            <div className="inline text-gray-400 mt-2 animate-pulse">
              &emsp;(click)
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleJudgeDecision = async () => {
    if (!args) return;
    
    setIsLoading(true);
    try {
      const prompt = `
      you are a judge evaluating the validity of each argument. 
      your task is to analyze the provided arguments and respond with ONLY a valid JSON object.
      DO NOT include any other text, markdown, or formatting.

      Evaluation criteria:
      - effectiveness score should be 0-100
      - arguments should be at least 10 words long to be considered valid
      - each argument must present a clear position or claim
      - pros and cons arrays should contain 2-5 items each
      - validation errors should be provided if either argument is invalid

      Arguments to evaluate:
      Person 1: ${args.person1}
      Person 2: ${args.person2}

      Respond with an object in this exact format:
      { 
        "winner": "argument_1" | "argument_2 | neither",
        "argument_1": {
          "isValidArgument": boolean,
          "effectiveness": number,
          "pros": string[],
          "cons": string[],
          "keyPoints": string[],
          "reasoningScore": number
        },
        "argument_2": {
          "isValidArgument": boolean,
          "effectiveness": number,
          "pros": string[],
          "cons": string[],
          "keyPoints": string[],
          "reasoningScore": number
        },
        "validationErrors": [
          {
            "code": "one of: INVALID_ARG_1, INVALID_ARG_2, INVALID_ARG_BOTH, INSUFFICIENT_LENGTH, NO_CLEAR_POSITION",
            "message": "detailed explanation of what's missing"
          }
        ],
        "summary": {
          "winningReason": string,
          "mainDifference": string
        }
      }`;

      const response = await api.generateText(prompt);
      const jsonString = response.content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(jsonString)
      let verdict = `I have reached my verdict. ${result.summary.mainDifference}.`
      switch (result.winner) {
        case "neither": 
          verdict += "Because of this, neither side wins."
          break
        case "argument_1":
          verdict += `With an effectiveness of ${result.argument_1.effectiveness} vs ${result.argument_2.effectiveness}, person one wins.`
          break
        case "argument_2":
          verdict += `With an effectiveness of ${result.argument_2.effectiveness} vs ${result.argument_1.effectiveness}, person two wins.`
          break
      }

      setCurrentSprite("talk");
      await new Promise(resolve => setTimeout(resolve, 500));
      setJudgeResponse(verdict);
      await new Promise(resolve => setTimeout(resolve, 200));
      setCurrentSprite("normal");
    } catch (error) {
      console.error("Error getting judge's response:", error);
      setJudgeResponse("I have carefully considered both arguments and reached my decision.");
    } finally {
      setIsLoading(false);
    }
  };

  const ArgumentForm = () => {    
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        person1Argument: "",
        person2Argument: ""
      },
    })

    const onSubmit = async(values: z.infer<typeof formSchema>) => {
      setArguments({
        person1: values.person1Argument,
        person2: values.person2Argument
      });
      setShowForm(false);
      setScene(0);
      setCurrentSprite("talk");
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentSprite("normal");
    }
  
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Argument Form</CardTitle>
          <CardDescription>
            Enter arguments from two different perspectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="person1Argument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Person ones's Argument</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter person one's argument here..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />    
              <FormField
                control={form.control}
                name="person2Argument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Person two's Argument</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter person two's argument here..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />   
              <Button type="submit" className="w-full">
                Submit Arguments
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {showForm ? (
        <ArgumentForm />
      ) : (
        <div className="relative w-[960px] h-[640px]">
          <SceneSelector type={scene} />
          <TextOverlay text={getSceneTexts()[scene]} />
          {scene === 2 && !isLoading && judgeResponse && (
            <Button
              className="absolute top-4 right-4"
              onClick={() => {
                setShowForm(true);
                setArguments(null);
                setJudgeResponse(null);
                setScene(0);
              }}
            >
              New Arguments
            </Button>
          )}
        </div>
      )}
    </div>
  );
}