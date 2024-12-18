/* global chrome */

import { Button } from "@/components/ui/button";
import { Check, Command, Filter, Plus, Search, Star } from "lucide-react";
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
import { linkQueryKey } from "@/constants/query-keys";
import { fetcher } from "@/lib/fetcher";
import LinkLoader from "@/components/link-loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";
import { normalizeUrl } from "@/lib/functions";

interface Link {
  id: string;
  name: string;
  url: string;
  tags: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tagName: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  sessionLinksId: string | null;
}

const App = () => {
  const delayDuration = 200;

  const [popoverOpen, setPopoverOpen] = useState(false);
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
      await fetcher("https://linkrem-three.vercel.app/api/link/all"),
    // enabled: tabValue === "links",
  });

  // Only initialize or change data variable when array of links changes
  const data: Array<Link> = useMemo(
    () => linkQuery.data?.links || [],
    [linkQuery.data?.links]
  );

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
        (oldLinks: { links: Array<Link> } | undefined) => {
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
        (oldLinks: { links: Array<Link> } | undefined) => {
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
    chrome.tabs.query({ active: true }, (tabs) => {
      const activeTab = tabs[0];
      const URL = activeTab.url || "";
      const title = activeTab.title || "";

      setSingleURL({ title, URL });
    });
  }, []);

  // For storing the condition of, Is link already exist
  useEffect(() => {
    const element = data?.find(
      (link) => normalizeUrl(link.url) === normalizeUrl(singleURL.URL)
    );

    setURLExistState({ boolean: !!element, value: element?.name || "" });
  }, [data, singleURL.URL, singleURL.title]);

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
    setPopoverOpen(false);
  }, [singleURL.title, singleURL.URL, linkMutate]);

  return (
    <main>
      <TooltipProvider>
        <div className="p-4 border-b space-y-2">
          <div className="flex justify-between">
            <Tooltip delayDuration={delayDuration}>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    type="button"
                    className={cn(
                      URLExistState.boolean
                        ? "bg-primary text-white hover:bg-primary/80"
                        : "bg-white hover:bg-slate-100"
                    )}
                    onClick={() => {
                      console.log("hello world");

                      if (URLExistState.boolean) {
                        deleteMutation.mutate(URLExistState.value);
                      } else {
                        setPopoverOpen(true);
                      }
                    }}
                  >
                    {URLExistState.boolean ? (
                      <Check className="text-white" />
                    ) : (
                      <Plus className="text-text" />
                    )}
                  </Button>
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

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setPopoverOpen(false)}
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
                    placeholder="Search Link Name"
                    className="w-full bg-muted"
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
                      <Filter className="text-text" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter</p>
                </TooltipContent>

                <PopoverContent>
                  Place content for the popover here.
                </PopoverContent>
              </Popover>
            </Tooltip>

            <Tooltip delayDuration={delayDuration}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  type="button"
                  className="bg-white hover:bg-slate-100"
                >
                  <Star className="text-text" />
                </Button>
              </TooltipTrigger>
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
          : data.map((link) => (
              <Link key={link.id} name={link.name} url={link.url} />
            ))}
      </div>
    </main>
  );
};

export default App;
