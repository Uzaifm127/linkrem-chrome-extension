import { Button } from "@/components/ui/button";
import { Command, Filter, Plus, Search, Star } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { linkQueryKey } from "@/constants/query-keys";
import { fetcher } from "@/lib/fetcher";
import LinkLoader from "@/components/link-loader";

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

  // Querying for links
  const linkQuery = useQuery({
    queryKey: [linkQueryKey],
    queryFn: async () =>
      await fetcher("https://lamb-evolved-panda.ngrok-free.app/api/link/all"),
    // enabled: tabValue === "links",
  });
  const data: Array<Link> = linkQuery.data?.links || [];

  console.log(`data: `, data);
  console.log(`linkQuery data: `, linkQuery.data);

  return (
    <main>
      <TooltipProvider>
        <div className="p-4 border-b space-y-2">
          <div className="flex justify-between">
            <Tooltip delayDuration={delayDuration}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  type="button"
                  className="bg-white hover:bg-slate-100"
                >
                  <Plus className="text-text" />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="start">
                <p>Add link</p>
              </TooltipContent>
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
              <Link
                key={link.id}
                name={link.name}
                tags={link.tags}
                url={link.url}
              />
            ))}
      </div>
    </main>
  );
};

export default App;
