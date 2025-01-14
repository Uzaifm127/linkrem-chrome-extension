import { Button } from "@/components/ui/button";
import { BookmarkPlus, Check, Command, Plus, Search, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "@/components/link";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { linkQueryKey, sessionQueryKey } from "@/constants/query-keys";
import { fetcher } from "@/lib/fetcher";
import LinkLoader from "@/components/link-loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import { normalizeUrl } from "@/lib/functions";
import { SessionLinkData, Link as LinkType, SessionLink } from "@/types/index";
import { sessionLinksCookieKey } from "./constants/cookies-keys";

const App = () => {
  const delayDuration = 200;

  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [sessionPopoverOpen, setSessionPopoverOpen] = useState(false);
  const [isSessionLinksDuplicated, setIsSessionLinksDuplicated] =
    useState(false);
  const [linkDataState, setLinkDataState] = useState<Array<LinkType>>([]);
  const [sessionSavingError, setSessionSavingError] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [URLExistState, setURLExistState] = useState({
    boolean: false,
    value: "",
  });
  const [singleURL, setSingleURL] = useState({
    title: "",
    URL: "",
  });

  const queryClient = useQueryClient();

  // Querying for links
  const linkQuery = useQuery({
    queryKey: [linkQueryKey],
    queryFn: async () =>
      await fetcher("https://linkrem-three.vercel.app/api/link/my-links"),
    // enabled: tabValue === "links",
  });

  // For setting the state of the link data to the previous
  const data: Array<LinkType> = useMemo(
    () => linkQuery.data?.links || [],
    [linkQuery.data?.links]
  );

  useEffect(() => {
    setLinkDataState(linkQuery.data?.links || []);
  }, [linkQuery.data?.links]);

  const sessionMutate = useMutation({
    mutationFn: async (sessionLinkData: SessionLinkData) =>
      await fetcher(
        "https://linkrem-three.vercel.app/api/session",
        "POST",
        sessionLinkData
      ),

    async onMutate(newSession) {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [sessionQueryKey] });

      // Getting the previous sessions
      const previousSessions = queryClient.getQueryData([sessionQueryKey]);

      // Optimistically updating the query data
      queryClient.setQueryData(
        [sessionQueryKey],
        (oldSessions: { sessions: Array<SessionLink> } | undefined) => {
          const sessionLinksId = uuid();

          if (oldSessions) {
            const links = newSession.links.map((link) => ({
              id: uuid(),
              name: link.name,
              url: link.url,
              sessionLinksId,
              createdAt: new Date(new Date().toISOString()),
              updatedAt: new Date(new Date().toISOString()),
            }));

            return {
              sessions: [
                ...oldSessions.sessions,
                {
                  id: sessionLinksId,
                  name: newSession.name,
                  links,
                  createdAt: new Date(new Date().toISOString()),
                  updatedAt: new Date(new Date().toISOString()),
                },
              ],
            };
          }
        }
      );

      // Return the context with previous value
      return { previousSessions };
    },
  });

  const linkMutate = useMutation({
    mutationFn: async (linkData: { name: string; url: string; tags: string }) =>
      await fetcher(
        "https://linkrem-three.vercel.app/api/link",
        "POST",
        linkData
      ),

    async onMutate(newLink) {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [linkQueryKey] });

      // Getting the previous links
      const previousLinks = queryClient.getQueryData([linkQueryKey]);

      // Optimistically updating the query data
      queryClient.setQueryData(
        [linkQueryKey],
        (oldLinks: { links: Array<LinkType> } | undefined) => {
          if (oldLinks) {
            return {
              links: [
                ...oldLinks.links,
                {
                  id: uuid(),
                  name: newLink.name,
                  url: newLink.url,
                  tags: [],
                  sessionLinksId: null,
                  createdAt: new Date(new Date().toISOString()),
                  updatedAt: new Date(new Date().toISOString()),
                },
              ],
            };
          }
        }
      );

      // Return the context with previous value
      return { previousLinks };
    },

    onError(_error, _newLink, context) {
      if (context) {
        queryClient.setQueryData([linkQueryKey], context.previousLinks);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (currentLinkName: string) =>
      await fetcher("https://linkrem-three.vercel.app/api/link", "DELETE", {
        currentLinkName,
      } as {
        currentLinkName: string;
      }),

    async onMutate(currentLinkName) {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [linkQueryKey] });

      // Getting the previous links
      const previousLinks = queryClient.getQueryData([linkQueryKey]);

      // Optimistically updating the query data
      queryClient.setQueryData(
        [linkQueryKey],
        (oldLinks: { links: Array<LinkType> } | undefined) => {
          if (oldLinks) {
            const updatedLinks = oldLinks.links.filter(
              (link) => link.name !== currentLinkName
            );

            return { links: updatedLinks };
          }
        }
      );

      // Return the context with previous value
      return { previousLinks };
    },

    onError(_error, _newLink, context) {
      if (context) {
        queryClient.setQueryData([linkQueryKey], context.previousLinks);
      }
    },
  });

  useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const URL = activeTab.url || "";
      const title = activeTab.title || "";

      setSingleURL({ title, URL });
    });
  }, []);

  // For storing the condition of, Is link already exist
  useEffect(() => {
    const element = linkDataState?.find(
      (link) => normalizeUrl(link.url) === normalizeUrl(singleURL.URL)
    );

    setURLExistState({ boolean: !!element, value: element?.name || "" });
  }, [linkDataState, singleURL.URL, singleURL.title]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, name } = e.currentTarget;

      setSingleURL((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const onLinkSave = useCallback(() => {
    const linkData = { name: singleURL.title, url: singleURL.URL, tags: "" };

    linkMutate.mutate(linkData);
    // Closing the popover
    setLinkPopoverOpen(false);
  }, [singleURL.title, singleURL.URL, linkMutate]);

  const onSessionSave = useCallback(async () => {
    if (!sessionName) {
      setSessionSavingError("Session name is required");
      return;
    }

    const tabs = await chrome.tabs.query({});

    const links = tabs.map((tab) => ({
      name: tab.title || "",
      url: tab.url || "",
    }));

    const filteredLinks = links.filter((link) => link.url && link.name);

    // Checking if links already existed or not
    const existingLinks = Cookies.get(sessionLinksCookieKey);

    if (
      existingLinks &&
      existingLinks.length > 0 &&
      JSON.stringify(existingLinks) === JSON.stringify(filteredLinks)
    ) {
      setIsSessionLinksDuplicated(true);
      setSessionSavingError("Session already exists");
    } else {
      setIsSessionLinksDuplicated(false);
      sessionMutate.mutate({ name: sessionName, links: filteredLinks });
    }

    // Closing the popover
    setSessionPopoverOpen(false);
  }, [sessionMutate, sessionName]);

  return (
    <main>
      <TooltipProvider>
        <div className="p-4 border-b space-y-2">
          <div className="flex justify-between">
            <Tooltip delayDuration={delayDuration}>
              <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
                <TooltipTrigger asChild>
                  <PopoverTrigger
                    asChild
                    onClick={(e) => {
                      if (URLExistState.boolean) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Button
                      size="icon"
                      type="button"
                      className={cn(
                        URLExistState.boolean
                          ? "bg-primary text-white hover:bg-primary/80"
                          : "bg-white hover:bg-slate-100"
                      )}
                      onClick={() => {
                        if (URLExistState.boolean) {
                          deleteMutation.mutate(URLExistState.value);
                        }
                      }}
                    >
                      {URLExistState.boolean ? (
                        <Check className="text-white" />
                      ) : (
                        <Plus className="text-text" />
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent align="start">
                  <p>{URLExistState.boolean ? "Remove" : "Add"} link</p>
                </TooltipContent>

                <PopoverContent align="start">
                  <div className="flex justify-center flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="page-title"
                        className="text-sm font-semibold"
                      >
                        Title
                      </label>
                      <Input
                        name="title"
                        id="page-title"
                        value={singleURL.title}
                        onChange={onInputChange}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="page-url"
                        className="text-sm font-semibold"
                      >
                        URL
                      </label>
                      <Input
                        name="URL"
                        id="page-url"
                        value={singleURL.URL}
                        disabled
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        onClick={() => setLinkPopoverOpen(false)}
                        variant={"outline"}
                        className="hover:bg-accent-foreground/20 hover:text-text text-sm"
                      >
                        Cancel
                      </Button>
                      <Button onClick={onLinkSave} className="text-sm">
                        Save
                      </Button>
                    </div>
                  </div>{" "}
                </PopoverContent>
              </Popover>
            </Tooltip>

            <Tooltip delayDuration={delayDuration}>
              <Popover>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      type="button"
                      className="bg-white hover:bg-slate-100"
                    >
                      <Command className="text-text" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shortcuts</p>
                </TooltipContent>

                <PopoverContent>
                  <div className="flex justify-center flex-col gap-1">
                    <div className="bg-primary/5 text-primary p-2 rounded-md">
                      Press <span>Shift + L</span> to save link
                    </div>
                    <div className="bg-primary/5 text-primary p-2 rounded-md">
                      Press <span>Shift + S</span> to save session
                    </div>
                  </div>{" "}
                </PopoverContent>
              </Popover>
            </Tooltip>

            <Tooltip delayDuration={delayDuration}>
              <Popover>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      type="button"
                      className="bg-white hover:bg-slate-100"
                    >
                      <Search className="text-text" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search</p>
                </TooltipContent>

                <PopoverContent>
                  <Input
                    type="search"
                    placeholder="Search by link name or URL"
                    className="w-full bg-muted"
                    onChange={(e) => {
                      const searchedValue = e.target.value;

                      if (searchedValue.length) {
                        setLinkDataState((prev) => {
                          return prev.filter(
                            (link) =>
                              link.name
                                .toLowerCase()
                                .includes(searchedValue.toLowerCase()) ||
                              link.url
                                .toLowerCase()
                                .includes(searchedValue.toLowerCase())
                          );
                        });
                      } else {
                        // Resetting the data
                        setLinkDataState(data);
                      }
                    }}
                  />{" "}
                </PopoverContent>
              </Popover>
            </Tooltip>

            <Tooltip delayDuration={delayDuration}>
              <Popover>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      type="button"
                      className="bg-white hover:bg-slate-100"
                    >
                      <BookmarkPlus className="text-text" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Extract bookmarks</p>
                </TooltipContent>

                <PopoverContent>
                  Place content for the popover here.
                </PopoverContent>
              </Popover>
            </Tooltip>

            <Tooltip delayDuration={delayDuration}>
              <Popover
                open={sessionPopoverOpen}
                onOpenChange={setSessionPopoverOpen}
              >
                <TooltipTrigger asChild>
                  <PopoverTrigger
                    asChild
                    onClick={(e) => {
                      if (isSessionLinksDuplicated) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Button
                      size="icon"
                      type="button"
                      className={cn(
                        isSessionLinksDuplicated
                          ? "bg-primary text-white hover:bg-primary/80"
                          : "bg-white hover:bg-slate-100"
                      )}
                    >
                      {isSessionLinksDuplicated ? (
                        <Check className="text-white" />
                      ) : (
                        <Star className="text-text" />
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent align="end">
                  <p>{isSessionLinksDuplicated ? "Remove" : "Add"} session</p>
                </TooltipContent>

                <PopoverContent
                  align="end"
                  onCloseAutoFocus={() => setLinkDataState(data)}
                >
                  <div className="flex justify-center flex-col gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="session-name"
                          className="text-sm font-semibold"
                        >
                          Session name
                        </label>
                        <Input
                          name="Session name"
                          id="session-name"
                          value={sessionName}
                          onChange={(e) => {
                            setSessionSavingError("");
                            setSessionName(e.target.value);
                          }}
                        />
                      </div>
                      <p className="text-red-500 text-sm mt-2">
                        {sessionSavingError}
                      </p>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        onClick={() => setSessionPopoverOpen(false)}
                        variant={"outline"}
                        className="hover:bg-accent-foreground/20 hover:text-text text-sm"
                      >
                        Cancel
                      </Button>
                      <Button onClick={onSessionSave} className="text-sm">
                        Save
                      </Button>
                    </div>
                  </div>{" "}
                </PopoverContent>
              </Popover>
              <TooltipContent align="end">
                <p>Add session</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>

      <div className="flex flex-col gap-4 p-4 overflow-y-scroll h-[25.6875rem] [scrollbar-width:none]">
        {linkQuery.isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <LinkLoader key={index + 1} />
            ))
          : linkDataState.map((link) => (
              <Link key={link.id} name={link.name} url={link.url} />
            ))}
      </div>
    </main>
  );
};

export default App;
