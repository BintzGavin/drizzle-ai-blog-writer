import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import HeroGift from "../public/logowriter.png";
import Logo from "../public/randomlogo.png";
import BlurImage from "../components/BlurImage";
import debounce from "lodash/debounce";
import posthog from "../lib/posthog";
import saveLocalCopy from "./api/save-local-copy";

interface TrendingStory {
  title: string;
  url: string;
  image: string;
}

const Index = () => {
  const [topic, setTopic] = useState("");
  const [trendingStories, setTrendingStories] = useState<TrendingStory[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [blogContents, setBlogContents] = useState<Array<string>>([]);
  const [imageUrls, setImageUrls] = useState<Array<string>>([]);
  const [generatedKeywords, setGeneratedKeywords] = useState<Array<string>>([]);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [currentStoriesTopic, setCurrentStoriesTopic] = useState("");
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const cache = useRef(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MIN_INTERVAL = 5000; // 5 seconds minimum between requests
  const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 1 day

  const ref = useRef<HTMLInputElement | null>(null);

  const MAX_KEYWORDS = 5;

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords((prevKeywords) => {
      if (prevKeywords.includes(keyword)) {
        return prevKeywords.filter((k) => k !== keyword);
      } else if (prevKeywords.length < MAX_KEYWORDS) {
        return [...prevKeywords, keyword];
      }
      return prevKeywords;
    });
  };

  const handleAddKeywords = (e: React.FormEvent) => {
    e.preventDefault();
    const keywordsArray = newKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(
        (keyword) => keyword !== "" && !selectedKeywords.includes(keyword)
      );

    setSelectedKeywords((prevKeywords) => {
      const availableSlots = MAX_KEYWORDS - prevKeywords.length;
      const newKeywordsToAdd = keywordsArray.slice(0, availableSlots);
      return [...prevKeywords, ...newKeywordsToAdd];
    });
    setNewKeywords("");
  };

  const fetchTrendingStories = useCallback(
    async (topic: string) => {
      if (topic.length >= 2) {
        const now = Date.now();
        if (now - lastRequestTime < 300) {
          console.log("Request too soon, skipping");
          return;
        }

        // Check cache
        const cacheKey = topic;
        const cachedData = cache.current.get(cacheKey);
        if (cachedData && now - cachedData.timestamp < CACHE_EXPIRATION) {
          console.log("Using cached result");
          setTrendingStories(cachedData.stories);
          setKeywords(cachedData.keywords);
          setCurrentStoriesTopic(topic);
          setNoResultsMessage("");
          return;
        }

        setIsLoading(true);

        try {
          const response = await fetch("/api/trending-stories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch trending stories");
          }

          const data = await response.json();
          console.log("Trending stories response:", data);
          if (data.stories && data.stories.length > 0) {
            setTrendingStories(data.stories);
            setCurrentStoriesTopic(topic);
            setNoResultsMessage("");

            const keywordsResponse = await fetch("/api/generate-keywords", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic, trendingStories: data.stories }),
            });

            if (!keywordsResponse.ok) {
              throw new Error("Failed to generate keywords");
            }

            const keywordsData = await keywordsResponse.json();
            console.log("Keywords response:", keywordsData);
            if (keywordsData.keywords && keywordsData.keywords.length > 0) {
              setKeywords(keywordsData.keywords);
            } else {
              console.error("No keywords generated");
              setNoResultsMessage("No keywords generated for this topic");
            }

            // Cache the result
            cache.current.set(cacheKey, {
              stories: data.stories,
              keywords: keywordsData.keywords,
              timestamp: now,
            });
          } else {
            console.error("No trending stories found");
            setNoResultsMessage(`No stories found for "${topic}"`);
            // Keep existing stories and keywords
          }

          setLastRequestTime(now);
        } catch (error) {
          console.error("Error:", error);
          setNoResultsMessage(
            "Error fetching trending stories and keywords for this topic"
          );
          // Keep existing stories and keywords
        } finally {
          setIsLoading(false);
        }
      } else {
        setTrendingStories([]);
        setKeywords([]);
        setCurrentStoriesTopic("");
        setNoResultsMessage("");
      }
    },
    [lastRequestTime]
  );

  const debouncedFetchTrendingStories = useCallback(
    debounce((topic: string) => fetchTrendingStories(topic), 300),
    [fetchTrendingStories]
  );

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (topic.length >= 2) {
      debouncedFetchTrendingStories(topic);

      // Set a timer to ensure the fetch happens after 5 seconds
      timerRef.current = setTimeout(() => {
        fetchTrendingStories(topic);
      }, MIN_INTERVAL);
    } else {
      setTrendingStories([]);
      setKeywords([]);
      setCurrentStoriesTopic("");
      setNoResultsMessage("");
    }

    // Cleanup function to cancel the debounce and clear the timer on unmount
    return () => {
      if (debouncedFetchTrendingStories.cancel) {
        debouncedFetchTrendingStories.cancel();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [topic]);

  async function onGenerateArticles(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setBlogContents(new Array(selectedKeywords.length).fill(""));
    setImageUrls(new Array(selectedKeywords.length).fill(""));
    setGeneratedKeywords(new Array(selectedKeywords.length).fill(""));

    posthog.identify(emailInput);

    selectedKeywords.forEach((keyword, index) => {
      generateContentForKeyword(keyword, index);
    });

    // Track the event in PostHog
    posthog.capture("articles_generated", {
      keywords: selectedKeywords,
    });

    setIsLoading(false);
  }

  async function generateContentForKeyword(keyword: string, index: number) {
    const imagePromise = fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    }).then((res) => res.json());

    const blogPromise = fetch("/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    }).then((res) => res.json());

    // Update UI as soon as image is ready
    imagePromise
      .then((imageData) => {
        setImageUrls((prevUrls) => {
          const newUrls = [...prevUrls];
          newUrls[index] = imageData.imageUrl || "";
          return newUrls;
        });

        setGeneratedKeywords((prevKeywords) => {
          const newKeywords = [...prevKeywords];
          newKeywords[index] = keyword;
          return newKeywords;
        });

        if (process.env.NODE_ENV !== "production") {
          fetch("/api/save-local-copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              keyword,
              imageUrl: imageData.imageUrl || "",
            }),
          }).catch((error) => console.error("Error saving local copy:", error));
        }
      })
      .catch((error) => {
        console.error(
          `Error generating image for keyword "${keyword}":`,
          error
        );
        setImageUrls((prevUrls) => {
          const newUrls = [...prevUrls];
          newUrls[index] = "";
          return newUrls;
        });

        setGeneratedKeywords((prevKeywords) => {
          const newKeywords = [...prevKeywords];
          newKeywords[index] = keyword;
          return newKeywords;
        });
      });

    // Update UI as soon as blog content is ready
    blogPromise
      .then((blogData) => {
        setBlogContents((prevContents) => {
          const newContents = [...prevContents];
          newContents[index] = blogData.postContentHtml;
          return newContents;
        });

        setGeneratedKeywords((prevKeywords) => {
          const newKeywords = [...prevKeywords];
          newKeywords[index] = keyword;
          return newKeywords;
        });

        // Save local copy if not in production
        if (process.env.NODE_ENV !== "production") {
          fetch("/api/save-local-copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              keyword,
              blogContent: blogData.blogContent,
            }),
          }).catch((error) => console.error("Error saving local copy:", error));
        }
      })
      .catch((error) => {
        console.error(
          `Error generating blog content for keyword "${keyword}":`,
          error
        );
        setBlogContents((prevContents) => {
          const newContents = [...prevContents];
          newContents[index] = "Error generating content";
          return newContents;
        });

        setGeneratedKeywords((prevKeywords) => {
          const newKeywords = [...prevKeywords];
          newKeywords[index] = keyword;
          return newKeywords;
        });
      });
  }

  const sendEmail = async (index: number) => {
    setSendingEmail(index);
    const content = blogContents[index];
    if (!content) return;

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput,
          postContentHtml: content,
          imageUrl: imageUrls[index],
          keyword: generatedKeywords[index],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(null);
    }
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col items-center min-h-screen relative pb-24 bg-tertiary text-senary font-sans">
      <BlurImage
        className="absolute left-0 w-[300px] h-[300px] hidden xl:block"
        width={300}
        height={300}
        src={HeroGift.src}
        alt="image of a writer's desk"
      />
      <div className="flex items-center justify-center mt-2">
        <div>
          <BlurImage width={40} height={40} src={Logo.src} alt="logo" />
        </div>
        <h1 className="text-2xl m-1 font-serif text-senary">drizzle.ai</h1>
      </div>

      <div className="w-full max-w-3xl mx-auto px-5 mb-12 z-10 bg-transparent rounded-lg">
        <h2 className="text-xl mb-4 text-senary">Enter a topic:</h2>
        <input
          type="text"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Type to search..."
          className="w-full p-3 mb-2 border border-quinary rounded-lg text-base bg-complementary-1 text-senary placeholder-senary"
        />
      </div>

      {noResultsMessage && (
        <p className="mt-0 text-base text-quinary">{noResultsMessage}</p>
      )}

      {trendingStories.length > 0 && (
        <div className="w-full max-w-5xl mx-auto px-5 mb-12 pt-5 pb-5 bg-quaternary rounded-lg">
          <h2
            id="start"
            className="text-complementary-1 text-center mb-4 font-serif"
          >
            Trending stories around "{currentStoriesTopic}":
          </h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trendingStories.map((story, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-md transition-transform hover:-translate-y-1"
              >
                {story.image && (
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-[150px] object-cover rounded-lg mb-3"
                  />
                )}
                <h4 className="text-lg font-semibold mb-2 text-senary">
                  {story.title}
                </h4>
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-secondary font-medium"
                >
                  Read more
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {keywords.length > 0 && (
        <>
          <div className="w-full max-w-3xl mx-auto px-5 mb-12">
            <h3 className="text-xl mb-2 text-senary font-serif">
              Suggested Keywords:
            </h3>
            <p className="text-sm mb-3 text-senary">
              {selectedKeywords.length}/{MAX_KEYWORDS} keywords selected
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <label
                  key={index}
                  className={`inline-flex items-center bg-complementary-1 rounded-full px-3 py-1 text-sm cursor-pointer transition-colors
                    ${
                      selectedKeywords.includes(keyword)
                        ? "bg-quaternary text-white"
                        : "text-senary"
                    }
                    ${
                      selectedKeywords.length >= MAX_KEYWORDS
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedKeywords.includes(keyword)}
                    onChange={() => handleKeywordToggle(keyword)}
                    disabled={
                      selectedKeywords.length >= MAX_KEYWORDS &&
                      !selectedKeywords.includes(keyword)
                    }
                    className="mr-2"
                  />
                  <span>{keyword}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="w-full max-w-3xl mx-auto px-5 mb-12">
            <h3 className="text-xl mb-2 text-senary font-serif">
              Add Custom Keywords (optional)
            </h3>
            <form onSubmit={handleAddKeywords} className="flex flex-col gap-2">
              <textarea
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="Enter custom keywords, separated by commas"
                rows={3}
                disabled={selectedKeywords.length >= MAX_KEYWORDS}
                className="w-full p-3 border border-quinary rounded-lg resize-none bg-complementary-1 text-senary placeholder-senary"
              />
              <p className="text-sm text-senary">
                Separate multiple keywords with commas. Duplicates will be
                automatically removed. Maximum {MAX_KEYWORDS} keywords allowed.
              </p>
              <button
                type="submit"
                disabled={
                  selectedKeywords.length >= MAX_KEYWORDS ||
                  newKeywords.trim() === ""
                }
                className="bg-gradient-to-r from-purple-500 to-primary text-white px-4 py-2 rounded-full uppercase font-bold tracking-wide text-sm hover:from-purple-600 hover:to-secondary transition-colors disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                Add Keywords
              </button>
            </form>
          </div>
        </>
      )}

      {selectedKeywords.length > 0 && (
        <div className="w-full max-w-3xl mx-auto px-5 mb-12">
          <h3 className="text-xl mb-2 text-senary font-serif">
            Selected Keywords:
          </h3>
          <p className="text-sm mb-3 text-senary">
            {selectedKeywords.length}/{MAX_KEYWORDS} keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((keyword, index) => (
              <div
                key={index}
                className="inline-flex items-center bg-quaternary text-white rounded-full px-3 py-1 text-sm"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => handleKeywordToggle(keyword)}
                  className="ml-2 text-lg hover:text-primary"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedKeywords.length > 0 && (
        <div className="w-full max-w-3xl mx-auto px-5 mb-12 pt-5 pb-5 bg-quaternary rounded-lg">
          <form onSubmit={onGenerateArticles} className="flex flex-col gap-4">
            <label htmlFor="email" className="text-complementary-1 font-serif">
              Email (required):
            </label>
            <input
              type="email"
              name="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-3 border border-quinary rounded-lg bg-complementary-1 text-senary placeholder-senary"
            />
            <button
              disabled={isLoading || emailInput === ""}
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-primary text-white px-6 py-3 rounded-full uppercase font-bold tracking-wide text-lg hover:from-purple-600 hover:to-secondary transition-colors disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
            >
              Generate Articles
            </button>
          </form>
        </div>
      )}

      <div ref={ref} className="w-full max-w-3xl mx-auto mt-12">
        {isLoading && blogContents.length === 0 && (
          <div className="flex justify-center mt-12">
            <div className="w-12 h-12 border-t-4 border-primary rounded-full animate-spin"></div>
          </div>
        )}
        {blogContents.length > 0 && (
          <div className="mt-12 space-y-6">
            {blogContents.map(
              (content, index) =>
                content && (
                  <div
                    key={index}
                    className="border border-quinary rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center p-4 bg-complementary-1 cursor-pointer"
                      onClick={() => {
                        if (content && content.length > 0)
                          toggleAccordion(index);
                      }}
                    >
                      <div
                        className={`w-[100px] h-[100px] mr-4 relative ${
                          expandedIndex === index ? "hidden" : ""
                        }`}
                      >
                        {imageUrls[index] ? (
                          <Image
                            src={imageUrls[index]}
                            alt={generatedKeywords[index]}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-senary flex-grow">
                        {generatedKeywords[index]}
                      </h3>
                      <svg
                        className={`w-6 h-6 transform transition-transform ${
                          expandedIndex === index ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {expandedIndex === index && (
                      <div className="p-4">
                        <div className="mb-4">
                          <Image
                            src={imageUrls[index]}
                            alt={generatedKeywords[index]}
                            width={300}
                            height={300}
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        </div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: content,
                          }}
                          className="text-senary"
                        />
                        <div className="mt-4">
                          <button
                            onClick={() => sendEmail(index)}
                            disabled={sendingEmail === index}
                            className="bg-gradient-to-r from-purple-500 to-primary text-white px-4 py-2 rounded-full text-sm hover:from-purple-600 hover:to-secondary transition-colors disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
                          >
                            {sendingEmail === index
                              ? "Sending..."
                              : "Send To Email 📨"}
                          </button>
                          <p className="mt-2 text-sm text-complementary-4 italic">
                            Sends an email to the address you entered with
                            attachments of this AI generated image and blog post
                            as a .md (markdown) file.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full text-center py-4 text-sm text-senary">
        Copyright © {new Date().getFullYear()}. All rights reserved.
      </div>
    </div>
  );
};

export default Index;
